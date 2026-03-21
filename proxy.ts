import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  // Core API routes
  "/api/projects(.*)",
  "/api/usage(.*)",
  // Platform data fetching (Phase 1)
  "/api/fetch-youtube(.*)",
  "/api/fetch-instagram(.*)",
  "/api/fetch-tiktok(.*)",
  // AI analysis (Phase 2)
  "/api/analyze(.*)",
])

// Webhooks use their own HMAC/svix signature verification — never run Clerk on them.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (process.env.NODE_ENV === "development") {
    const pathname = req.nextUrl.pathname
    const isProtected = isProtectedRoute(req)
    const isPublic = isPublicRoute(req)
    const label = isPublic ? "PUBLIC" : isProtected ? "PROTECTED" : "unmatched (public)"
    console.log(`[Middleware] ${req.method} ${pathname} — ${label}`)
  }

  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
