/**
 * Instagram data fetching via Instagram Scraper Stable API (RapidAPI)
 * Provider: thetechguy32744
 * Host: instagram-scraper-stable-api.p.rapidapi.com
 *
 * Strategy:
 *   1. GET  /ig_get_fb_profile_hover.php  → profile metadata
 *   2. POST /get_ig_user_reels.php        → recent reels/posts with engagement
 *
 * Known limitations of this API:
 *   - caption text is not returned by the reels endpoint
 *   - taken_at (post timestamp) is not returned by the reels endpoint
 *   - As a result, hashtags and postingFrequency will be empty/0
 *
 * All functions return Result<T, InstagramError> — never throw.
 */

import type {
  Result,
  InstagramProfileData,
  InstagramProfile,
  InstagramPost,
  InstagramError,
  InstagramErrorCode,
  StableApiProfileResponse,
  StableApiReelsResponse,
  StableApiReelMediaItem,
} from "@/types/platforms"
import { env } from "@/lib/env"

const RAPIDAPI_HOST = "instagram-scraper-stable-api.p.rapidapi.com"
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`

// ── Error helpers ─────────────────────────────────────────────────────────────

function makeError(code: InstagramErrorCode, message: string): InstagramError {
  return { code, message }
}

function mapApiError(status: number, body: unknown): InstagramError {
  if (status === 404) {
    return makeError("INVALID_ACCOUNT", "Instagram account not found.")
  }
  if (status === 429) {
    return makeError(
      "RATE_LIMITED",
      "RapidAPI rate limit reached. Upgrade your plan or try again later."
    )
  }
  if (status === 403) {
    return makeError(
      "PRIVATE_ACCOUNT",
      "This Instagram account is private or access was denied."
    )
  }
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).message === "string" &&
    ((body as Record<string, unknown>).message as string)
      .toLowerCase()
      .includes("private")
  ) {
    return makeError("PRIVATE_ACCOUNT", "This Instagram account is private.")
  }
  return makeError("UNKNOWN", `Unexpected API response (HTTP ${status}).`)
}

// ── Low-level fetchers ────────────────────────────────────────────────────────

const sharedHeaders = () => ({
  "x-rapidapi-key": env.RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
})

/** GET request — appends params as query string */
async function rapidApiGet<T>(
  path: string,
  params: Record<string, string>
): Promise<Result<T, InstagramError>> {
  const url = new URL(`${RAPIDAPI_BASE}${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  let response: Response
  try {
    response = await fetch(url.toString(), {
      headers: sharedHeaders(),
      cache: "no-store",
    })
  } catch (cause) {
    return {
      success: false,
      error: makeError(
        "NETWORK_ERROR",
        `Network request failed: ${cause instanceof Error ? cause.message : String(cause)}`
      ),
    }
  }

  return parseResponse<T>(response)
}

/**
 * POST request with application/x-www-form-urlencoded body.
 * The reels endpoint requires form-encoded data, not JSON.
 */
async function rapidApiPost<T>(
  path: string,
  params: Record<string, string>
): Promise<Result<T, InstagramError>> {
  const url = `${RAPIDAPI_BASE}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        ...sharedHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
      cache: "no-store",
    })
  } catch (cause) {
    return {
      success: false,
      error: makeError(
        "NETWORK_ERROR",
        `Network request failed: ${cause instanceof Error ? cause.message : String(cause)}`
      ),
    }
  }

  return parseResponse<T>(response)
}

async function parseResponse<T>(
  response: Response
): Promise<Result<T, InstagramError>> {
  let json: unknown
  try {
    json = await response.json()
  } catch {
    return {
      success: false,
      error: makeError(
        "PARSE_ERROR",
        `Failed to parse API response as JSON (HTTP ${response.status})`
      ),
    }
  }

  if (!response.ok) {
    return { success: false, error: mapApiError(response.status, json) }
  }

  return { success: true, data: json as T }
}

// ── Data mapping helpers ──────────────────────────────────────────────────────

/** Maps the numeric media_type field to a readable label. */
function toMediaType(typeNum: number): "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" {
  if (typeNum === 2) return "VIDEO"
  if (typeNum === 8) return "CAROUSEL_ALBUM"
  return "IMAGE"
}

/**
 * Maps a raw reel media item to our clean InstagramPost shape.
 *
 * Note: caption and taken_at are not returned by this endpoint.
 * engagementRate is calculated from like + comment counts vs follower count.
 */
function mapReel(
  media: StableApiReelMediaItem,
  followersCount: number
): InstagramPost {
  const captionText = media.caption?.text ?? ""
  const thumbnail = media.image_versions2?.candidates[0]?.url ?? ""

  const engagementRate =
    followersCount > 0
      ? Math.round(
          ((media.like_count + media.comment_count) / followersCount) * 10000
        ) / 100
      : 0

  // taken_at is not provided by this endpoint; leave publishedAt empty.
  const publishedAt =
    media.taken_at != null
      ? new Date(media.taken_at * 1000).toISOString()
      : ""

  return {
    postId: media.pk,
    caption: captionText,
    hashtags: [],
    likeCount: media.like_count,
    commentCount: media.comment_count,
    engagementRate,
    publishedAt,
    mediaType: toMediaType(media.media_type),
    thumbnailUrl: thumbnail,
  }
}

/** Mean engagementRate across all posts, rounded to 2 decimal places. */
function calcAverageEngagement(posts: InstagramPost[]): number {
  if (posts.length === 0) return 0
  const total = posts.reduce((sum, p) => sum + p.engagementRate, 0)
  return Math.round((total / posts.length) * 100) / 100
}

/**
 * Calculates posts per week from the date span of returned posts.
 * Returns 0 when timestamps are unavailable.
 */
function calcPostingFrequency(posts: InstagramPost[]): number {
  const dated = posts.filter((p) => p.publishedAt !== "")
  if (dated.length < 2) return 0

  const timestamps = dated
    .map((p) => new Date(p.publishedAt).getTime())
    .sort((a, b) => a - b)

  const spanMs = timestamps[timestamps.length - 1] - timestamps[0]
  const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000)
  return spanWeeks === 0
    ? dated.length
    : Math.round((dated.length / spanWeeks) * 10) / 10
}

// ── Input normaliser ──────────────────────────────────────────────────────────

/**
 * Normalises various input formats to a plain lowercase username:
 *   "@natgeo"                       → "natgeo"
 *   "https://instagram.com/natgeo/" → "natgeo"
 *   "natgeo"                        → "natgeo"
 */
function parseUsername(input: string): string {
  return input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\/?/, "")
    .replace(/[/?#].*$/, "")
    .toLowerCase()
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches an Instagram profile and its most recent reels/posts.
 *
 * Makes two API calls:
 *   1. Profile metadata (GET /ig_get_fb_profile_hover.php)
 *   2. Recent posts/reels with engagement (POST /get_ig_user_reels.php)
 *
 * @param usernameInput  Accepts "@username", full URL, or plain handle.
 * @param maxPosts       Max number of recent posts to return (1–50, default 12).
 */
export async function fetchInstagramProfile(
  usernameInput: string,
  maxPosts = 12
): Promise<Result<InstagramProfileData, InstagramError>> {
  const username = parseUsername(usernameInput)

  if (!username) {
    return {
      success: false,
      error: makeError(
        "INVALID_ACCOUNT",
        "Could not parse a valid Instagram username from the input."
      ),
    }
  }

  // ── 1. Profile ──────────────────────────────────────────────────────────────
  const profileResult = await rapidApiGet<StableApiProfileResponse>(
    "/ig_get_fb_profile_hover.php",
    { username_or_url: username }
  )
  if (!profileResult.success) return profileResult

  const rawUser = profileResult.data.user_data

  if (rawUser.is_private) {
    return {
      success: false,
      error: makeError(
        "PRIVATE_ACCOUNT",
        `@${username}'s account is private — public data is not available.`
      ),
    }
  }

  // ── 2. Recent posts/reels ───────────────────────────────────────────────────
  const reelsResult = await rapidApiPost<StableApiReelsResponse>(
    "/get_ig_user_reels.php",
    {
      username_or_url: username,
      amount: String(maxPosts),
      pagination_token: "",
    }
  )
  if (!reelsResult.success) return reelsResult

  const posts = reelsResult.data.reels
    .slice(0, maxPosts)
    .map((item) => mapReel(item.node.media, rawUser.follower_count))

  const profile: InstagramProfile = {
    username: rawUser.username,
    followersCount: rawUser.follower_count,
    followingCount: rawUser.following_count,
    postsCount: rawUser.media_count,
    bio: rawUser.biography ?? "",
    averageEngagementRate: calcAverageEngagement(posts),
    postingFrequency: calcPostingFrequency(posts),
  }

  return { success: true, data: { profile, recentPosts: posts } }
}
