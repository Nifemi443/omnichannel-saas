import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  // Cast required: @prisma/adapter-pg bundles its own @types/pg, causing a
  // duplicate Pool type that TypeScript cannot reconcile structurally.
  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
