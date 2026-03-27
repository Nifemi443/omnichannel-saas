import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/auth"
import { generateLimiter } from "@/lib/rateLimit"
import { fetchYouTubeChannel } from "@/lib/youtube"
import { fetchInstagramProfile } from "@/lib/instagram"
import { analyseYouTubeChannel, analyseInstagramProfile } from "@/lib/ai"
import type { AnalyzeSuccessResponse, AnalyzeErrorResponse, AnalyzeErrorCode } from "@/types/analysis"

export const dynamic = "force-dynamic"

// ── Request schema ────────────────────────────────────────────────────────────

const analyzeSchema = z.object({
  platform: z.enum(["youtube", "instagram"], {
    required_error: "platform is required",
    invalid_type_error: "platform must be 'youtube' or 'instagram'",
  }),
  handle: z
    .string({ required_error: "handle is required" })
    .min(1, "handle cannot be empty")
    .max(200, "handle is too long")
    .trim(),
})

type AnalyzeInput = z.infer<typeof analyzeSchema>

// ── Route handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/analyze
 *
 * Orchestrates the full analysis pipeline:
 *   1. Authenticates the user
 *   2. Checks the AI generation rate limit (5 req/min per user)
 *   3. Checks the user's processing quota
 *   4. Fetches platform data (YouTube or Instagram)
 *   5. Runs Claude AI analysis
 *   6. Returns typed AIAnalysisResult
 *
 * Request body:
 *   { platform: "youtube" | "instagram", handle: string }
 *
 * Responses:
 *   200  { data: AIAnalysisResult }
 *   400  { error: string, code: "VALIDATION_ERROR" }
 *   401  { error: "Unauthorized" }
 *   403  { error: string, code: "QUOTA_EXCEEDED" }
 *   429  { error: string, code: "RATE_LIMITED" }
 *   502  { error: string, code: "PLATFORM_FETCH_ERROR" }
 *   500  { error: string, code: "AI_ERROR" | "UNKNOWN" }
 */
export async function POST(
  request: Request
): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  let userId: string
  let processingMinsUsed: number
  let processingMinsLimit: number

  try {
    const user = await getAuthenticatedUser()
    userId = user.id
    processingMinsUsed = user.processingMinsUsed
    processingMinsLimit = user.processingMinsLimit
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized — sign in to use this endpoint", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }
    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "User account not found. Sign out and sign back in.", code: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }
    console.error("[POST /api/analyze] Auth error:", err)
    return NextResponse.json(
      { error: "Internal server error", code: "UNKNOWN" },
      { status: 500 }
    )
  }

  // ── 2. Rate limit (AI generation — tight limit) ───────────────────────────
  const rateResult = generateLimiter(userId)
  if (!rateResult.success) {
    return NextResponse.json(
      {
        error: "Too many analysis requests. Wait a minute before trying again.",
        code: "RATE_LIMITED",
        resetIn: rateResult.resetIn,
      },
      { status: 429 }
    )
  }

  // ── 3. Processing quota ───────────────────────────────────────────────────
  if (processingMinsUsed >= processingMinsLimit) {
    return NextResponse.json(
      {
        error: `Processing limit reached (${processingMinsUsed}/${processingMinsLimit} mins used). Upgrade to Pro for more.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 403 }
    )
  }

  // ── 4. Validate body ──────────────────────────────────────────────────────
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const parsed = analyzeSchema.safeParse(rawBody)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Invalid request body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    )
  }

  const { platform, handle }: AnalyzeInput = parsed.data

  // ── 5. Fetch platform data ────────────────────────────────────────────────
  if (platform === "youtube") {
    const fetchResult = await fetchYouTubeChannel(handle)
    if (!fetchResult.success) {
      const status = fetchResult.error.code === "INVALID_CHANNEL" ? 404
        : fetchResult.error.code === "PRIVATE_CHANNEL" ? 403
        : fetchResult.error.code === "QUOTA_EXCEEDED" ? 429
        : 502
      return NextResponse.json(
        { error: fetchResult.error.message, code: "PLATFORM_FETCH_ERROR" },
        { status }
      )
    }

    // ── 6. AI analysis ──────────────────────────────────────────────────────
    const aiResult = await analyseYouTubeChannel(fetchResult.data)
    if (!aiResult.success) {
      const code: AnalyzeErrorCode = aiResult.error.code === "PARSE_ERROR" ? "AI_ERROR" : "AI_ERROR"
      return NextResponse.json(
        { error: aiResult.error.message, code },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: aiResult.data }, { status: 200 })
  }

  // platform === "instagram"
  const fetchResult = await fetchInstagramProfile(handle)
  if (!fetchResult.success) {
    const status = fetchResult.error.code === "INVALID_ACCOUNT" ? 404
      : fetchResult.error.code === "PRIVATE_ACCOUNT" ? 403
      : fetchResult.error.code === "RATE_LIMITED" ? 429
      : 502
    return NextResponse.json(
      { error: fetchResult.error.message, code: "PLATFORM_FETCH_ERROR" },
      { status }
    )
  }

  const aiResult = await analyseInstagramProfile(fetchResult.data)
  if (!aiResult.success) {
    return NextResponse.json(
      { error: aiResult.error.message, code: "AI_ERROR" },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: aiResult.data }, { status: 200 })
}
