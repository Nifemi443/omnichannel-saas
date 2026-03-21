import { createHmac } from "crypto"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

  if (!PAYSTACK_SECRET_KEY) {
    console.error("PAYSTACK_SECRET_KEY is not set")
    return new Response("Server misconfiguration", { status: 500 })
  }

  const body = await request.text()

  const paystackSignature = request.headers.get("x-paystack-signature")

  if (!paystackSignature) {
    return new Response("Missing x-paystack-signature header", { status: 400 })
  }

  const expectedSignature = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex")

  if (paystackSignature !== expectedSignature) {
    console.warn("Paystack webhook signature mismatch")
    return new Response("Invalid signature", { status: 400 })
  }

  let event: { event: string; data: { customer: { email: string } } }

  try {
    event = JSON.parse(body)
  } catch {
    return new Response("Invalid JSON payload", { status: 400 })
  }

  if (event.event !== "charge.success") {
    return new Response("Event ignored", { status: 200 })
  }

  const email = event.data?.customer?.email

  if (!email) {
    return new Response("Missing customer email in payload", { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { email },
      data: {
        plan: "pro",
        processingMinsLimit: 6000,
      },
    })

    console.log(`Upgraded user to pro: ${email}`)
    return new Response("User upgraded to pro", { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Failed to update user plan in database:", message)
    return new Response(`Database error: ${message}`, { status: 500 })
  }
}
