// ── Generic Result type ───────────────────────────────────────────────────────
// Used throughout the platform fetch utilities to avoid thrown errors.
// Every fetch function returns Result<T, E> — callers must handle both cases.

export type Result<T, E extends { code: string; message: string } = AppError> =
  | { success: true; data: T }
  | { success: false; error: E }

export interface AppError {
  code: string
  message: string
}

// ── Platform union ────────────────────────────────────────────────────────────

export type Platform = "youtube" | "instagram" | "tiktok"

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────

// ── Clean output types (returned to callers) ──────────────────────────────────

export interface YouTubeVideo {
  videoId: string
  title: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string // ISO 8601
  description: string
  tags: string[]
  thumbnailUrl: string
}

export interface YouTubeChannel {
  channelId: string
  handle: string
  title: string
  description: string
  /** 0 when the channel has hidden subscriber count */
  subscriberCount: number
  totalVideoCount: number
  uploadsPlaylistId: string
}

export interface YouTubeChannelData {
  channel: YouTubeChannel
  videos: YouTubeVideo[]
}

// ── Error types ───────────────────────────────────────────────────────────────

export type YouTubeErrorCode =
  | "INVALID_CHANNEL"
  | "QUOTA_EXCEEDED"
  | "PRIVATE_CHANNEL"
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN"

export interface YouTubeError {
  code: YouTubeErrorCode
  message: string
}

// ── Raw YouTube Data API v3 response shapes ───────────────────────────────────
// Used internally in lib/youtube.ts to type raw API responses before mapping.
// Not exported from the app's public API surface.

export interface YouTubeApiResponse<T> {
  kind: string
  etag: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: T[]
  nextPageToken?: string
}

export interface YouTubeApiChannelItem {
  kind: string
  etag: string
  id: string
  snippet: {
    title: string
    description: string
    customUrl: string
    publishedAt: string
    thumbnails: {
      default: { url: string; width?: number; height?: number }
      medium: { url: string; width?: number; height?: number }
      high: { url: string; width?: number; height?: number }
    }
    country?: string
    localized?: { title: string; description: string }
  }
  statistics: {
    viewCount: string
    subscriberCount: string
    hiddenSubscriberCount: boolean
    videoCount: string
  }
  contentDetails: {
    relatedPlaylists: {
      uploads: string
      likes?: string
      favorites?: string
    }
  }
}

export interface YouTubeApiPlaylistItem {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      high?: { url: string; width: number; height: number }
      standard?: { url: string; width: number; height: number }
      maxres?: { url: string; width: number; height: number }
    }
    resourceId: {
      kind: string
      videoId: string
    }
    videoOwnerChannelId?: string
    videoOwnerChannelTitle?: string
  }
  contentDetails: {
    videoId: string
    videoPublishedAt: string
  }
}

export interface YouTubeApiVideoItem {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      high?: { url: string; width: number; height: number }
      standard?: { url: string; width: number; height: number }
      maxres?: { url: string; width: number; height: number }
    }
    channelTitle: string
    tags?: string[]
    categoryId: string
    liveBroadcastContent: string
  }
  statistics: {
    viewCount: string
    likeCount?: string
    dislikeCount?: string
    favoriteCount: string
    commentCount?: string
  }
}

export interface YouTubeApiErrorDetail {
  message: string
  domain: string
  reason: string
  location?: string
  locationType?: string
}

export interface YouTubeApiErrorResponse {
  error: {
    code: number
    message: string
    errors: YouTubeApiErrorDetail[]
    status?: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM — placeholder shapes (Phase 1, Step 2)
// ─────────────────────────────────────────────────────────────────────────────

export interface InstagramPost {
  postId: string
  caption: string
  hashtags: string[]
  likeCount: number
  commentCount: number
  /** (likeCount + commentCount) / followersCount * 100, rounded to 2 dp */
  engagementRate: number
  publishedAt: string // ISO 8601
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  thumbnailUrl: string
}

export interface InstagramProfile {
  username: string
  followersCount: number
  followingCount: number
  postsCount: number
  bio: string
  /** Average engagementRate across returned posts */
  averageEngagementRate: number
  /** Posts per week calculated from the date span of returned posts */
  postingFrequency: number
}

export interface InstagramProfileData {
  profile: InstagramProfile
  recentPosts: InstagramPost[]
}

export type InstagramErrorCode =
  | "INVALID_ACCOUNT"
  | "PRIVATE_ACCOUNT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN"

export interface InstagramError {
  code: InstagramErrorCode
  message: string
}

// ── Raw response shapes for Instagram Scraper Stable API ─────────────────────
// Provider: thetechguy32744 on RapidAPI
// Host: instagram-scraper-stable-api.p.rapidapi.com
// Used internally in lib/instagram.ts. Not part of the public API surface.

/**
 * GET /ig_get_fb_profile_hover.php?username_or_url={username}
 * Returns profile metadata for a public Instagram account.
 */
export interface StableApiProfileResponse {
  user_data: {
    pk: string
    id: string
    username: string
    full_name: string
    follower_count: number
    following_count: number
    media_count: number
    is_private: boolean
    is_verified: boolean
    biography?: string
    profile_pic_url?: string
    [key: string]: unknown
  }
}

/**
 * POST /get_ig_user_reels.php (form-encoded body)
 * Body params: username_or_url, amount, pagination_token
 *
 * NOTE: caption and taken_at are not included in this endpoint's response.
 * Engagement (like_count, comment_count) and play_count are available.
 */
export interface StableApiReelMediaItem {
  pk: string
  id: string
  /** Instagram shortcode — constructs post URL: instagram.com/reel/{code} */
  code: string
  like_count: number
  comment_count: number
  /** Available for Reels; null for regular posts */
  play_count: number | null
  view_count: number | null
  like_and_view_counts_disabled: boolean
  /** 1 = IMAGE, 2 = VIDEO/REEL, 8 = CAROUSEL_ALBUM */
  media_type: number
  image_versions2?: {
    candidates: Array<{ url: string; width: number; height: number }>
  }
  caption?: { text: string } | null
  /** Unix timestamp in seconds — absent from the User Reels endpoint */
  taken_at?: number | null
}

export interface StableApiReelItem {
  node: {
    media: StableApiReelMediaItem
    __typename: string
  }
  cursor: string
}

export interface StableApiReelsResponse {
  reels: StableApiReelItem[]
  pagination_token: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TIKTOK — placeholder shapes (Phase 1, Step 3)
// ─────────────────────────────────────────────────────────────────────────────

export interface TikTokVideo {
  videoId: string
  description: string
  hashtags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  publishedAt: string
  thumbnailUrl: string
  duration: number
}

export interface TikTokProfile {
  username: string
  displayName: string
  followersCount: number
  followingCount: number
  totalLikes: number
  videoCount: number
  bio: string
}

export interface TikTokProfileData {
  profile: TikTokProfile
  recentVideos: TikTokVideo[]
}

export type TikTokErrorCode =
  | "INVALID_ACCOUNT"
  | "PRIVATE_ACCOUNT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN"

export interface TikTokError {
  code: TikTokErrorCode
  message: string
}
