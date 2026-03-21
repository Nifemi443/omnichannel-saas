import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { User } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rateLimit"

export type ApiContext = {
  user: User
}

type ApiHandler = (req: Request, ctx: ApiContext) => Promise<Response>

/**
 * withApiGateway — wraps an API route handler with:
 *   1. Clerk authentication (rejects unauthenticated requests with 401)
 *   2. User lookup from the database (rejects unknown clerkIds with 404)
 *   3. Sliding-window rate limiting based on the user's plan (429 on breach)
 *   4. Processing minutes quota check (403 when limit is reached)
 *   5. Injects the resolved User record into the handler context
 *   6. Attaches X-RateLimit-* headers to every successful response
 */
export function withApiGateway(handler: ApiHandler) {
  return async (req: Request): Promise<Response> => {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ── 2. User lookup ───────────────────────────────────────────────────────
    let user: User | null

    try {
      user = await prisma.user.findUnique({ where: { clerkId: userId } })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error("[API Gateway] DB error during user lookup:", message)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // ── 3. Rate limit ────────────────────────────────────────────────────────
    const rateResult = checkRateLimit(`user:${user.id}`, user.plan)

    const rateLimitHeaders = {
      "X-RateLimit-Remaining": String(rateResult.remaining),
      "X-RateLimit-Reset": String(Date.now() + rateResult.resetIn),
    }

    if (!rateResult.success) {
      const retryAfter = Math.ceil(rateResult.resetIn / 1000)
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": String(retryAfter),
          },
        }
      )
    }

    // ── 4. Processing minutes quota ──────────────────────────────────────────
    if (user.processingMinsUsed >= user.processingMinsLimit) {
      return NextResponse.json(
        {
          error: "Processing limit reached.",
          detail: `You have used ${user.processingMinsUsed} of ${user.processingMinsLimit} minutes. Upgrade to Pro for more.`,
        },
        { status: 403 }
      )
    }

    // ── 5. Call the route handler ────────────────────────────────────────────
    const response = await handler(req, { user })

    // ── 6. Attach rate limit headers to the response ─────────────────────────
    const finalHeaders = new Headers(response.headers)
    Object.entries(rateLimitHeaders).forEach(([k, v]) => finalHeaders.set(k, v))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: finalHeaders,
    })
  }
}
