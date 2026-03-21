import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { generateLimiter, apiLimiter } from "@/lib/rateLimit"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i

// ── POST /api/projects ────────────────────────────────────────────────────────
// Creates a new Project row and returns it immediately (status: PROCESSING).
// The AI pipeline runs asynchronously in a background job (separate task).

export async function POST(request: Request) {
  // ── Step 1: Auth ─────────────────────────────────────────────────────────
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>

  try {
    user = await getAuthenticatedUser()
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Account not found. Please sign out and sign back in." },
        { status: 404 }
      )
    }
    console.error("[POST /api/projects] Unexpected auth error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

  // ── Step 2: Rate limit (AI generation — 5 req/min) ───────────────────────
  const rateResult = generateLimiter(user.id)

  if (!rateResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        resetIn: rateResult.resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }

  // ── Step 3: Processing quota check ───────────────────────────────────────
  if (user.processingMinsUsed >= user.processingMinsLimit) {
    return NextResponse.json(
      {
        error: "Monthly processing limit reached. Upgrade to Pro.",
        used: user.processingMinsUsed,
        limit: user.processingMinsLimit,
      },
      { status: 403 }
    )
  }

  // ── Step 4: Validate request body ────────────────────────────────────────
  let originalUrl: string

  try {
    const body = await request.json()
    originalUrl = body?.originalUrl ?? ""
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!originalUrl || !YOUTUBE_URL_REGEX.test(originalUrl.trim())) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
  }

  // Normalise: ensure the URL has a protocol
  const normalizedUrl = originalUrl.trim().startsWith("http")
    ? originalUrl.trim()
    : `https://${originalUrl.trim()}`

  // ── Step 5: Create project in database ───────────────────────────────────
  let project: Awaited<ReturnType<typeof prisma.project.create>>

  try {
    project = await prisma.project.create({
      data: {
        userId: user.id,
        originalUrl: normalizedUrl,
        status: "PROCESSING",
        title: null,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[POST /api/projects] DB error:", message)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }

  // ── Step 6: Return created project immediately ────────────────────────────
  // The heavy AI processing is handled by a background job — we don't block here.
  return NextResponse.json({ project }, { status: 201 })
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
// Returns all projects for the authenticated user, newest first, with clips.

export async function GET() {
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>

  try {
    user = await getAuthenticatedUser()
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

  // Rate limit GET requests with the general limiter (60/min)
  const rateResult = apiLimiter(user.id)

  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests", resetIn: rateResult.resetIn },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)) },
      }
    )
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { clips: true },
    })

    return NextResponse.json({ projects }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[GET /api/projects] DB error:", message)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
