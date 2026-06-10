// Prisma v7+ uses adapter-based connections.
// This module provides a lazy-initialized database client.
// Configure via prisma.config.ts and pass adapter to PrismaClient constructor.

let _db: unknown = null;

export function getDb() {
  if (!_db) {
    // Dynamic import to avoid build-time resolution errors
    // When using Prisma v7+, configure the adapter in prisma.config.ts
    // and pass it to the PrismaClient constructor here.
    console.warn('Database not configured. Set up prisma.config.ts for Prisma v7+.');
  }
  return _db;
}

export const db = getDb();
