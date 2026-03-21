import { env } from "@/lib/env"
import type {
  Result,
  YouTubeChannelData,
  YouTubeChannel,
  YouTubeVideo,
  YouTubeError,
  YouTubeErrorCode,
  YouTubeApiResponse,
  YouTubeApiChannelItem,
  YouTubeApiPlaylistItem,
  YouTubeApiVideoItem,
  YouTubeApiErrorResponse,
} from "@/types/platforms"

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

// ── Internal helpers ──────────────────────────────────────────────────────────

function makeError(code: YouTubeErrorCode, message: string): YouTubeError {
  return { code, message }
}

/**
 * Maps a raw YouTube API error response to a typed YouTubeError.
 * Inspects the error `reason` field to distinguish quota, auth, and not-found errors.
 */
function mapApiError(status: number, body: YouTubeApiErrorResponse): YouTubeError {
  const firstError = body.error.errors[0]
  const reason = firstError?.reason ?? ""

  if (status === 403 && (reason === "quotaExceeded" || reason === "dailyLimitExceeded")) {
    return makeError(
      "QUOTA_EXCEEDED",
      "YouTube API daily quota exceeded. Quota resets at midnight Pacific Time."
    )
  }

  if (status === 403 && reason === "forbidden") {
    return makeError("PRIVATE_CHANNEL", "This channel is private or access is restricted.")
  }

  if (status === 404 || reason === "channelNotFound" || reason === "playlistNotFound") {
    return makeError("INVALID_CHANNEL", "Channel not found. Check the handle or URL and try again.")
  }

  if (status === 400 && reason === "keyInvalid") {
    return makeError("UNKNOWN", "Invalid YouTube API key. Check your YOUTUBE_API_KEY environment variable.")
  }

  return makeError("UNKNOWN", body.error.message || `YouTube API error (HTTP ${status})`)
}

// ── Typed fetch wrapper ───────────────────────────────────────────────────────

/**
 * Generic fetch helper for YouTube Data API v3.
 * Handles network errors, non-OK responses, and JSON parse failures.
 * Returns a typed Result so callers never deal with thrown errors.
 */
async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<Result<T, YouTubeError>> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`)

  const allParams = { ...params, key: env.YOUTUBE_API_KEY }
  for (const [key, value] of Object.entries(allParams)) {
    url.searchParams.set(key, value)
  }

  let response: Response
  try {
    // Disable Next.js fetch caching — YouTube data must always be fresh
    response = await fetch(url.toString(), { cache: "no-store" })
  } catch (err) {
    return {
      success: false,
      error: makeError(
        "NETWORK_ERROR",
        err instanceof Error ? err.message : "Network request to YouTube API failed"
      ),
    }
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    return {
      success: false,
      error: makeError("PARSE_ERROR", "Failed to parse YouTube API response as JSON"),
    }
  }

  if (!response.ok) {
    // Narrow unknown to the error response shape before calling mapApiError
    const errorBody = json as YouTubeApiErrorResponse
    return { success: false, error: mapApiError(response.status, errorBody) }
  }

  return { success: true, data: json as T }
}

// ── Input normalisation ───────────────────────────────────────────────────────

type ChannelIdentifier =
  | { type: "handle"; value: string }
  | { type: "id"; value: string }

/**
 * Normalises several YouTube channel input formats into a typed identifier.
 *
 * Supported inputs:
 *   "@mkbhd"                                           → handle: mkbhd
 *   "mkbhd"                                            → handle: mkbhd
 *   "https://youtube.com/@mkbhd"                       → handle: mkbhd
 *   "https://youtube.com/c/mkbhd"                      → handle: mkbhd
 *   "https://youtube.com/user/mkbhd"                   → handle: mkbhd
 *   "UCBcRF18a7Qf58cCRy5xuWwQ"                         → id: UCBcRF18a7Qf58cCRy5xuWwQ
 *   "https://youtube.com/channel/UCBcRF18a7Qf58cCRy5xuWwQ" → id: UCBcRF18a7Qf58cCRy5xuWwQ
 */
function parseChannelInput(input: string): ChannelIdentifier | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Attempt URL parsing
  try {
    const urlStr = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    const url = new URL(urlStr)

    if (url.hostname.includes("youtube.com") || url.hostname === "youtu.be") {
      // /@handle
      const atMatch = url.pathname.match(/^\/@([^/]+)/)
      if (atMatch?.[1]) return { type: "handle", value: atMatch[1] }

      // /channel/UCxxx
      const channelMatch = url.pathname.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})/)
      if (channelMatch?.[1]) return { type: "id", value: channelMatch[1] }

      // /c/handle or /user/handle
      const legacyMatch = url.pathname.match(/^\/(?:c|user)\/([^/]+)/)
      if (legacyMatch?.[1]) return { type: "handle", value: legacyMatch[1] }
    }
  } catch {
    // Not a URL — fall through to plain string matching
  }

  // Channel ID: starts with UC, 24 chars total
  if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) {
    return { type: "id", value: trimmed }
  }

  // Plain handle with or without @
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed
  if (handle.length > 0 && handle.length <= 100) {
    return { type: "handle", value: handle }
  }

  return null
}

// ── API call wrappers ─────────────────────────────────────────────────────────

async function getChannelByHandle(
  handle: string
): Promise<Result<YouTubeApiChannelItem, YouTubeError>> {
  const result = await youtubeGet<YouTubeApiResponse<YouTubeApiChannelItem>>("channels", {
    part: "snippet,statistics,contentDetails",
    forHandle: handle,
    maxResults: "1",
  })

  if (!result.success) return result

  // YouTube omits the `items` key entirely (rather than returning []) when no channel matches
  const item = result.data.items?.[0]
  if (!item) {
    return {
      success: false,
      error: makeError("INVALID_CHANNEL", `No YouTube channel found for handle: @${handle}`),
    }
  }

  return { success: true, data: item }
}

async function getChannelById(
  channelId: string
): Promise<Result<YouTubeApiChannelItem, YouTubeError>> {
  const result = await youtubeGet<YouTubeApiResponse<YouTubeApiChannelItem>>("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  })

  if (!result.success) return result

  // YouTube omits the `items` key entirely (rather than returning []) when no channel matches
  const item = result.data.items?.[0]
  if (!item) {
    return {
      success: false,
      error: makeError("INVALID_CHANNEL", `No YouTube channel found for ID: ${channelId}`),
    }
  }

  return { success: true, data: item }
}

async function getPlaylistVideoIds(
  uploadsPlaylistId: string,
  maxResults: number
): Promise<Result<string[], YouTubeError>> {
  const result = await youtubeGet<YouTubeApiResponse<YouTubeApiPlaylistItem>>("playlistItems", {
    part: "contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
  })

  if (!result.success) return result

  const ids = result.data.items
    .map((item) => item.contentDetails.videoId)
    .filter((id): id is string => Boolean(id))

  return { success: true, data: ids }
}

async function getVideoDetails(
  videoIds: string[]
): Promise<Result<YouTubeApiVideoItem[], YouTubeError>> {
  if (videoIds.length === 0) return { success: true, data: [] }

  // YouTube videos.list accepts up to 50 IDs in one call
  const result = await youtubeGet<YouTubeApiResponse<YouTubeApiVideoItem>>("videos", {
    part: "snippet,statistics",
    id: videoIds.join(","),
  })

  if (!result.success) return result

  return { success: true, data: result.data.items }
}

// ── Data mappers ──────────────────────────────────────────────────────────────

function mapChannel(item: YouTubeApiChannelItem, rawHandle: string): YouTubeChannel {
  return {
    channelId: item.id,
    // customUrl is the @handle set by the creator. Fall back to the input handle.
    handle: item.snippet.customUrl ?? rawHandle,
    title: item.snippet.title,
    description: item.snippet.description,
    // When hiddenSubscriberCount is true the API returns "0" — preserve that
    subscriberCount: item.statistics.hiddenSubscriberCount
      ? 0
      : parseInt(item.statistics.subscriberCount, 10) || 0,
    totalVideoCount: parseInt(item.statistics.videoCount, 10) || 0,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  }
}

function mapVideo(item: YouTubeApiVideoItem): YouTubeVideo {
  // Pick the highest resolution thumbnail available
  const t = item.snippet.thumbnails
  const thumbnailUrl =
    t.maxres?.url ??
    t.standard?.url ??
    t.high?.url ??
    t.medium?.url ??
    t.default?.url ??
    ""

  return {
    videoId: item.id,
    title: item.snippet.title,
    viewCount: parseInt(item.statistics.viewCount, 10) || 0,
    // likeCount and commentCount can be disabled by the creator — default to 0
    likeCount: parseInt(item.statistics.likeCount ?? "0", 10) || 0,
    commentCount: parseInt(item.statistics.commentCount ?? "0", 10) || 0,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
    tags: item.snippet.tags ?? [],
    thumbnailUrl,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches a YouTube channel and its most recent videos.
 *
 * Makes 3 sequential API calls (channels → playlistItems → videos).
 * Each costs 1 quota unit, totalling 3 units per invocation.
 * The YouTube Data API v3 free quota is 10,000 units/day.
 *
 * @param input  Channel handle (@mkbhd), plain handle, channel URL, or UC... channel ID
 * @param maxVideos  Number of recent videos to fetch (default 10, max 50)
 */
export async function fetchYouTubeChannel(
  input: string,
  maxVideos = 10
): Promise<Result<YouTubeChannelData, YouTubeError>> {
  // 1. Normalise the input
  const identifier = parseChannelInput(input)
  if (!identifier) {
    return {
      success: false,
      error: makeError(
        "INVALID_CHANNEL",
        "Could not parse the channel handle or URL. Try using the @handle format."
      ),
    }
  }

  // 2. Fetch channel metadata
  const channelResult =
    identifier.type === "handle"
      ? await getChannelByHandle(identifier.value)
      : await getChannelById(identifier.value)

  if (!channelResult.success) return channelResult

  const channel = mapChannel(channelResult.data, identifier.value)

  // 3. Fetch the last N video IDs from the channel's uploads playlist
  const idsResult = await getPlaylistVideoIds(
    channel.uploadsPlaylistId,
    Math.min(maxVideos, 50)
  )
  if (!idsResult.success) return idsResult

  // 4. Fetch full video details (snippet + statistics) for those IDs
  const videosResult = await getVideoDetails(idsResult.data)
  if (!videosResult.success) return videosResult

  return {
    success: true,
    data: {
      channel,
      videos: videosResult.data.map(mapVideo),
    },
  }
}
