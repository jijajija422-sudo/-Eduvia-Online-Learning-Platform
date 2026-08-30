import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

// Choose the database adapter based on the DATABASE_URL protocol:
//   postgresql://...  -> PrismaPg  (production on Vercel)
//   file:./dev.db     -> PrismaBetterSqlite3 (local development)
const url = process.env.DATABASE_URL || "file:./dev.db";
const isPostgres =
  url.startsWith("postgresql://") || url.startsWith("postgres://");

let adapter: PrismaPg | PrismaBetterSqlite3;

if (isPostgres) {
  adapter = new PrismaPg({ url });
} else {
  const dbPath = url.replace("file:", "");
  const dbDir = path.dirname(dbPath);
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  adapter = new PrismaBetterSqlite3({ url });
}

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
