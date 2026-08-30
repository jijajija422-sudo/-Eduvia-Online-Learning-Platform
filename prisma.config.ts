import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

config();

// Prisma 7: the datasource connection `url` MUST live here (not in
// schema.prisma). Reads DATABASE_URL and falls back to POSTGRES_PRISMA_URL
// (Vercel Postgres), then a local placeholder so `prisma generate`/build work
// without a live DB.
export default defineConfig({
  datasource: {
    url:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      "postgresql://localhost:5432/eduvia?sslmode=require",
  },
});
