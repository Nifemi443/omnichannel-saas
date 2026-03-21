import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/auth"
import { apiLimiter } from "@/lib/rateLimit"
import { fetchInstagramProfile } from "@/lib/instagram"
import type { InstagramProfileData, InstagramError } from "@/types/platforms"

export const dynamic = "force-dynamic"

// ── Request schema ────────────────────────────────────────────────────────────

const fetchInstagramSchema = z.object({
  /**
   * Accepts any of:
   *   "@username" | "username" | "https://instagram.com/username"
   */
  username: z.string().min(1, "username is required")
    .min(1, "username cannot be empty")
    .max(30, "Instagram usernames cannot exceed 30 characters")
    .trim(),

  /**
   * Number of recent posts to fetch. Defaults to 12, max 50.
   * The free RapidAPI tier returns up to 12 posts per call.
   */
  maxPosts: z.number().int().min(1).max(50).optional().default(12),
})

type FetchInstagramInput = z.infer<typeof fetchInstagramSchema>

// ── Response types ────────────────────────────────────────────────────────────

type SuccessResponse = { data: InstagramProfileData }

type ErrorResponse = {
  error: string
  code?: InstagramError["code"] | "VALIDATION_ERROR" | "UNAUTHORIZED" | "USER_NOT_FOUND"
  resetIn?: number
}

// Maps InstagramErrorCode to HTTP status codes
const ERROR_STATUS_MAP: Record<InstagramError["code"], number> = {
  INVALID_ACCOUNT: 404,
  PRIVATE_ACCOUNT: 403,
  RATE_LIMITED: 429,
  NETWORK_ERROR: 502,
  PARSE_ERROR: 502,
  UNKNOWN: 500,
}

// ── Route handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/fetch-instagram
 *
 * Fetches a public Instagram profile and its recent posts via RapidAPI.
 *
 * Request body:
 *   { username: string, maxPosts?: number }
 *
 * Responses:
 *   200  { data: InstagramProfileData }
 *   400  { error: string, code: "VALIDATION_ERROR" }
 *   401  { error: "Unauthorized" }
 *   403  { error: string, code: "PRIVATE_ACCOUNT" }
 *   404  { error: string, code: "INVALID_ACCOUNT" }
 *   429  { error: string, code: "RATE_LIMITED", resetIn?: number }
 *   500  { error: string, code: "UNKNOWN" }
 *   502  { error: string, code: "NETWORK_ERROR" | "PARSE_ERROR" }
 */
export async function POST(
  request: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  // ── Auth + rate limit ───────────────────────────────────────────────────────
  let userId: string
  try {
    const user = await getAuthenticatedUser()
    userId = user.id
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized — sign in to use this endpoint" },
        { status: 401 }
      )
    }
    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "User account not found. Sign out and sign back in." },
        { status: 404 }
      )
    }
    console.error("[POST /api/fetch-instagram] Auth error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

  const rateResult = apiLimiter(userId)
  if (!rateResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Slow down.",
        resetIn: rateResult.resetIn,
      },
      { status: 429 }
    )
  }

  // ── Parse + validate request body ──────────────────────────────────────────
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON", code: "VALIDATION_ERROR" as const },
      { status: 400 }
    )
  }

  const parsed = fetchInstagramSchema.safeParse(rawBody)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Invalid request body",
        code: "VALIDATION_ERROR" as const,
      },
      { status: 400 }
    )
  }

  const { username, maxPosts }: FetchInstagramInput = parsed.data

  // ── Fetch Instagram data ────────────────────────────────────────────────────
  const result = await fetchInstagramProfile(username, maxPosts)

  if (!result.success) {
    const status = ERROR_STATUS_MAP[result.error.code] ?? 500
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status }
    )
  }

  return NextResponse.json({ data: result.data }, { status: 200 })
}
