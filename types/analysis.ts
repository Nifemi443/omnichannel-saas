// ── AI Analysis Result ────────────────────────────────────────────────────────
// Returned by POST /api/analyze and lib/ai.ts
// Every field is required — Claude is instructed to always populate all fields.

export interface ContentRecommendation {
  /** Short title for the recommendation, e.g. "Post Reels at 7PM" */
  title: string
  /** Why this recommendation matters for their specific audience */
  rationale: string
  /** e.g. "Reel", "Carousel", "Story", "YouTube Short" */
  contentType: string
  /** Rough estimate, e.g. "15,000 – 40,000 views" */
  estimatedReach: string
}

export interface AIAnalysisResult {
  /** 5 actionable content recommendations tailored to the account */
  recommendations: [
    ContentRecommendation,
    ContentRecommendation,
    ContentRecommendation,
    ContentRecommendation,
    ContentRecommendation,
  ]
  /** 3 best times to post, e.g. ["Wednesday 7PM WAT", "Friday 6PM WAT"] */
  bestPostingTimes: [string, string, string]
  /** 10 hashtags ranked by relevance for their niche, without the # symbol */
  topHashtags: [
    string, string, string, string, string,
    string, string, string, string, string,
  ]
  /**
   * Topics or content angles their niche commonly covers that this account
   * hasn't addressed — opportunities to fill the gap.
   */
  competitorGapAnalysis: string[]
  /** One-paragraph plain-English health summary of the account */
  accountHealthSummary: string
}

// ── Analysis record (as stored in DB / returned with history) ─────────────────

export type AnalysisPlatform = "youtube" | "instagram"

export interface AnalysisRecord {
  id: string
  platform: AnalysisPlatform
  handle: string
  result: AIAnalysisResult
  createdAt: string // ISO 8601
}

// ── API shapes ────────────────────────────────────────────────────────────────

export interface AnalyzeRequestBody {
  platform: AnalysisPlatform
  handle: string
}

export interface AnalyzeSuccessResponse {
  data: AIAnalysisResult
}

export type AnalyzeErrorCode =
  | "VALIDATION_ERROR"
  | "PLATFORM_FETCH_ERROR"
  | "AI_ERROR"
  | "UNAUTHORIZED"
  | "USER_NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "UNKNOWN"

export interface AnalyzeErrorResponse {
  error: string
  code: AnalyzeErrorCode
  resetIn?: number
}
