import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set")
    return new Response("Server misconfiguration", { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await request.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  if (evt.type !== "user.created") {
    return new Response("Event ignored", { status: 200 })
  }

  const { id: clerkId, email_addresses } = evt.data

  if (!clerkId || !email_addresses?.length) {
    return new Response("Missing user data in payload", { status: 400 })
  }

  const primaryEmail = email_addresses[0].email_address

  try {
    await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        plan: "free",
        processingMinsUsed: 0,
        processingMinsLimit: 60,
      },
    })

    console.log(`User created: ${primaryEmail} (clerkId: ${clerkId})`)
    return new Response("User created", { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Failed to create user in database:", message)
    return new Response(`Database error: ${message}`, { status: 500 })
  }
}
