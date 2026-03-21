/**
 * Typed environment variable accessor.
 *
 * Uses getters so each value is read lazily — only when the getter is
 * accessed at runtime, not at module evaluation time. This means:
 *   - Build-time `prisma generate` and similar CLI commands won't throw
 *     if a variable isn't set in the CI environment.
 *   - A clear, actionable error is thrown the first time a missing
 *     variable is actually needed, pointing straight to the culprit.
 *
 * Add every server-side environment variable here. Never access
 * process.env directly elsewhere in the codebase.
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Add it to .env.local and restart the dev server.`
    )
  }
  return value
}

export const env = {
  // ── YouTube Data API v3 ───────────────────────────────────────────────────
  // Get from: https://console.cloud.google.com → Enable "YouTube Data API v3" → Create API Key
  get YOUTUBE_API_KEY() {
    return requireEnv("YOUTUBE_API_KEY")
  },

  // ── RapidAPI (Instagram Scraper API 2 + TikTok) ───────────────────────────
  // Get from: https://rapidapi.com → sign up → "My Apps" → "Add New App" → copy "X-RapidAPI-Key"
  // Subscribe to: https://rapidapi.com/letscrape-6brhm4d126/api/instagram-scraper-api2
  // Free tier: 100 req/month. One key works for all RapidAPI services.
  get RAPIDAPI_KEY() {
    return requireEnv("RAPIDAPI_KEY")
  },

  // ── Anthropic Claude API ─────────────────────────────────────────────────
  // Get from: https://console.anthropic.com → API Keys
  get ANTHROPIC_API_KEY() {
    return requireEnv("ANTHROPIC_API_KEY")
  },

  // ── Clerk ─────────────────────────────────────────────────────────────────
  get CLERK_SECRET_KEY() {
    return requireEnv("CLERK_SECRET_KEY")
  },
  get CLERK_WEBHOOK_SECRET() {
    return requireEnv("CLERK_WEBHOOK_SECRET")
  },

  // ── Database ─────────────────────────────────────────────────────────────
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL")
  },
} as const
