import "dotenv/config";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Load .env.local so DATABASE_URL is available to the Prisma CLI
config({ path: path.resolve(__dirname, ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use pooler URL for migrations since direct port 5432 is blocked in WSL2
    url: process.env.DATABASE_URL ?? "",
  },
});
