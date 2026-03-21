import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { User } from "@prisma/client"

/**
 * getAuthenticatedUser — resolves the current Clerk session to a database User.
 *
 * Call this at the top of every protected API route instead of repeating
 * the auth + DB lookup boilerplate.
 *
 * Throws:
 *   "UNAUTHORIZED"    — no active Clerk session
 *   "USER_NOT_FOUND"  — session exists but no matching DB row (Clerk webhook missed)
 *
 * Usage:
 *   const user = await getAuthenticatedUser()
 */
export async function getAuthenticatedUser(): Promise<User> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("UNAUTHORIZED")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error("USER_NOT_FOUND")
  }

  return user
}
