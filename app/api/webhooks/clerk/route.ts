import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// PRISMA V7 ARCHITECTURE: Initialize the Postgres Adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)

// Initialize Prisma with the new adapter
const prisma = new PrismaClient({ adapter })

export async function POST(req: Request) {
  // We will get this secret key from Clerk in the next step
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers to verify the message is actually from Clerk
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the raw body of the message
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload mathematically
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // THE MAGIC HAPPENS HERE
  const eventType = evt.type

  // If a brand new user just signed up...
  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data

    if (!id || !email_addresses) {
      return new Response('Error occurred -- missing data', {
        status: 400
      })
    }

    // Prepare the data to match our Prisma schema
    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
    }

    // Save the user into Supabase!
    await prisma.user.create({
      data: user,
    })
    
    console.log(`Successfully saved user ${user.email} to database!`)
  }

  return new Response('', { status: 200 })
}