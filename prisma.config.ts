import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Force Prisma to read your Next.js secret vault
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});