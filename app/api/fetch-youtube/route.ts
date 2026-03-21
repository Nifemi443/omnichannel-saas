import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/auth"
import { fetchYouTubeChannel } from "@/lib/youtube"
import type { YouTubeChannelData, YouTubeError } from "@/types/platforms"

export const dynamic = "force-dynamic"

// ── Request schema ────────────────────────────────────────────────────────────

const fetchYouTubeSchema = z.object({
  /**
   * Accepts any of:
   *   "@mkbhd" | "mkbhd" | "https://youtube.com/@mkbhd" | "UCBcRF18a7Qf58cCRy5xuWwQ"
   */
  handle: z
    .string({ required_error: "handle is required" })
    .min(1, "handle cannot be empty")
    .max(200, "handle is too long")
    .trim(),

  /**
   * Number of recent videos to fetch. Defaults to 10, max 50.
   * Each call costs 3 YouTube API quota units regardless of this value.
   */
  maxVideos: z.number().int().min(1).max(50).optional().default(10),
})

type FetchYouTubeInput = z.infer<typeof fetchYouTubeSchema>

// ── Response types ────────────────────────────────────────────────────────────

type SuccessResponse = {
  data: YouTubeChannelData
}

type ErrorResponse = {
  error: string
  code?: YouTubeError["code"] | "VALIDATION_ERROR" | "UNAUTHORIZED" | "USER_NOT_FOUND"
}

// Maps YouTubeErrorCode to HTTP status codes
const ERROR_STATUS_MAP: Record<YouTubeError["code"], number> = {
  INVALID_CHANNEL: 404,
  QUOTA_EXCEEDED: 429,
  PRIVATE_CHANNEL: 403,
  NETWORK_ERROR: 502,
  PARSE_ERROR: 502,
  UNKNOWN: 500,
}

// ── Route handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/fetch-youtube
 *
 * Fetches a YouTube channel's metadata and recent videos.
 *
 * Request body:
 *   { handle: string, maxVideos?: number }
 *
 * Responses:
 *   200  { data: YouTubeChannelData }
 *   400  { error: string, code: "VALIDATION_ERROR" }
 *   401  { error: "Unauthorized" }
 *   403  { error: string, code: "PRIVATE_CHANNEL" }
 *   404  { error: string, code: "INVALID_CHANNEL" }
 *   429  { error: string, code: "QUOTA_EXCEEDED" }
 *   500  { error: string, code: "UNKNOWN" }
 *   502  { error: string, code: "NETWORK_ERROR" | "PARSE_ERROR" }
 */
export async function POST(
  request: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  try {
    await getAuthenticatedUser()
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
    console.error("[POST /api/fetch-youtube] Auth error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

  const parsed = fetchYouTubeSchema.safeParse(rawBody)
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

  const { handle, maxVideos }: FetchYouTubeInput = parsed.data

  // ── Fetch YouTube data ──────────────────────────────────────────────────────
  const result = await fetchYouTubeChannel(handle, maxVideos)

  if (!result.success) {
    const status = ERROR_STATUS_MAP[result.error.code] ?? 500
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status }
    )
  }

  return NextResponse.json({ data: result.data }, { status: 200 })
}
