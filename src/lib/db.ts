import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Resolve the database URL. Vercel Postgres exposes POSTGRES_PRISMA_URL in
// addition to DATABASE_URL, so we accept either. A local placeholder is used
// only so the PrismaClient can be constructed at build time / before the first
// query — real connections only happen at request time against the real URL.
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://localhost:5432/eduvia?sslmode=require";

// Prisma 7 keeps the datasource `url` in prisma.config.ts and the schema
// provider is "postgresql", so we always use the Postgres driver adapter.
const adapter = new PrismaPg(dbUrl);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
