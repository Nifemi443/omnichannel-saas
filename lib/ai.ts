/**
 * AI analysis engine — powered by Anthropic Claude.
 *
 * Takes typed platform data (YouTube or Instagram) and returns a fully-typed
 * AIAnalysisResult. The prompt is tuned for Nigerian content creators and
 * Nigerian business owners; it references local trends, culture, and audience
 * behaviour explicitly.
 *
 * Returns Result<AIAnalysisResult, AiError> — never throws.
 */

import Anthropic from "@anthropic-ai/sdk"
import { env } from "@/lib/env"
import type { AIAnalysisResult } from "@/types/analysis"
import type { YouTubeChannelData } from "@/types/platforms"
import type { InstagramProfileData } from "@/types/platforms"

// ── Error type ────────────────────────────────────────────────────────────────

export type AiErrorCode =
  | "PROMPT_FAILED"
  | "PARSE_ERROR"
  | "CONTEXT_TOO_LARGE"
  | "UNKNOWN"

export interface AiError {
  code: AiErrorCode
  message: string
}

export type AiResult =
  | { success: true; data: AIAnalysisResult }
  | { success: false; error: AiError }

// ── Client (lazy singleton) ───────────────────────────────────────────────────

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }
  return _client
}

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildYouTubeContext(data: YouTubeChannelData): string {
  const { channel, videos } = data
  const topVideos = videos
    .slice(0, 5)
    .map(
      (v, i) =>
        `  ${i + 1}. "${v.title}" — ${v.viewCount.toLocaleString()} views, ${v.likeCount.toLocaleString()} likes, ${v.commentCount.toLocaleString()} comments\n     Tags: ${v.tags.slice(0, 6).join(", ") || "none"}`
    )
    .join("\n")

  return `
PLATFORM: YouTube
CHANNEL: ${channel.title} (@${channel.handle})
SUBSCRIBERS: ${channel.subscriberCount.toLocaleString()}
TOTAL VIDEOS: ${channel.totalVideoCount}

RECENT VIDEOS (last ${videos.length}):
${topVideos}
`.trim()
}

function buildInstagramContext(data: InstagramProfileData): string {
  const { profile, recentPosts } = data
  const postSummary = recentPosts
    .slice(0, 6)
    .map(
      (p, i) =>
        `  ${i + 1}. ${p.mediaType} — ${p.likeCount.toLocaleString()} likes, ${p.commentCount.toLocaleString()} comments, ${p.engagementRate}% engagement${p.caption ? `\n     Caption: "${p.caption.slice(0, 120)}${p.caption.length > 120 ? "…" : ""}"` : ""}`
    )
    .join("\n")

  return `
PLATFORM: Instagram
ACCOUNT: @${profile.username}
FOLLOWERS: ${profile.followersCount.toLocaleString()}
FOLLOWING: ${profile.followingCount.toLocaleString()}
TOTAL POSTS: ${profile.postsCount}
AVG ENGAGEMENT RATE: ${profile.averageEngagementRate}%
POSTING FREQUENCY: ${profile.postingFrequency > 0 ? `${profile.postingFrequency} posts/week` : "unknown"}
BIO: ${profile.bio || "(no bio)"}

RECENT POSTS (last ${recentPosts.length}):
${postSummary}
`.trim()
}

function buildPrompt(platformContext: string): string {
  return `You are an expert social media strategist and SEO consultant specialising in the Nigerian digital market. You deeply understand Nigerian internet culture, Afrobeats, Nollywood, Lagos business culture, Nigerian Twitter (X), Nigerian Gen Z slang, and how Nigerian audiences engage with content online.

Your task is to analyse the following social media account data and return a comprehensive, actionable SEO and content strategy tailored specifically for a Nigerian creator or business owner targeting Nigerian audiences.

=== ACCOUNT DATA ===
${platformContext}
=== END DATA ===

Return ONLY a valid JSON object — no markdown, no explanation, no code fences. The JSON must exactly match this TypeScript interface:

{
  "recommendations": [
    {
      "title": string,         // Short action title
      "rationale": string,     // Why this works for Nigerian audiences specifically
      "contentType": string,   // e.g. "Reel", "Carousel", "YouTube Short", "Poll"
      "estimatedReach": string // e.g. "10,000 – 30,000 views"
    }
    // exactly 5 items
  ],
  "bestPostingTimes": [string, string, string], // exactly 3 strings, use WAT timezone
  "topHashtags": [string, string, string, string, string, string, string, string, string, string], // exactly 10 strings WITHOUT # symbol
  "competitorGapAnalysis": string[], // 3-5 topic gaps vs competitors in their niche
  "accountHealthSummary": string    // 1 paragraph, plain English, Nigerian context
}

Rules:
- All recommendations must reference Nigerian trends, local slang, or Nigerian audience behaviour
- bestPostingTimes must use WAT (West Africa Time, UTC+1) and reference days Nigerian audiences are most active
- topHashtags must include a mix of Nigerian-specific tags (e.g. naija, Lagos) and niche-relevant global tags
- competitorGapAnalysis must identify real content gaps for someone in this niche targeting Nigeria
- accountHealthSummary must open with a direct assessment ("This account is…") and close with one key priority
- Return ONLY the JSON object. Any other text will cause a parse error.`
}

// ── JSON extractor ────────────────────────────────────────────────────────────

/**
 * Extracts the first valid JSON object from the model response.
 * Claude occasionally wraps JSON in markdown fences despite instructions.
 */
function extractJson(text: string): string {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced?.[1]) return fenced[1].trim()

  // Find the outermost {...} block
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1)
  }

  return text.trim()
}

function validateResult(obj: unknown): obj is AIAnalysisResult {
  if (typeof obj !== "object" || obj === null) return false
  const r = obj as Record<string, unknown>
  return (
    Array.isArray(r.recommendations) &&
    r.recommendations.length === 5 &&
    Array.isArray(r.bestPostingTimes) &&
    r.bestPostingTimes.length === 3 &&
    Array.isArray(r.topHashtags) &&
    r.topHashtags.length === 10 &&
    Array.isArray(r.competitorGapAnalysis) &&
    typeof r.accountHealthSummary === "string"
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function analyseYouTubeChannel(
  data: YouTubeChannelData
): Promise<AiResult> {
  return runAnalysis(buildYouTubeContext(data))
}

export async function analyseInstagramProfile(
  data: InstagramProfileData
): Promise<AiResult> {
  return runAnalysis(buildInstagramContext(data))
}

async function runAnalysis(platformContext: string): Promise<AiResult> {
  const prompt = buildPrompt(platformContext)

  let responseText: string
  try {
    const message = await getClient().messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    })

    const block = message.content[0]
    if (block.type !== "text") {
      return {
        success: false,
        error: { code: "PROMPT_FAILED", message: "Claude returned a non-text response block." },
      }
    }
    responseText = block.text
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause)

    if (msg.includes("prompt is too long") || msg.includes("context_length")) {
      return {
        success: false,
        error: { code: "CONTEXT_TOO_LARGE", message: "Input data too large for the model context window." },
      }
    }

    return {
      success: false,
      error: { code: "PROMPT_FAILED", message: `Claude API error: ${msg}` },
    }
  }

  // Parse the JSON response
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJson(responseText))
  } catch {
    return {
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: "Claude returned a response that could not be parsed as JSON.",
      },
    }
  }

  if (!validateResult(parsed)) {
    return {
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: "Claude response was valid JSON but did not match the expected AIAnalysisResult shape.",
      },
    }
  }

  return { success: true, data: parsed }
}
