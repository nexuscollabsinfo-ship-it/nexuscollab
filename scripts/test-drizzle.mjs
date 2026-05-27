/**
 * Tests Drizzle ORM SELECT queries directly against Supabase
 * to expose the real error behind "Failed query"
 */
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { desc, sql } from "drizzle-orm";
import * as schema from "../db/schema.ts";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema });

console.log("\n🔍 Testing Drizzle SELECT queries...\n");

// Test 1: client_requests
try {
  const rows = await db.select().from(schema.clientRequests).orderBy(desc(schema.clientRequests.createdAt)).limit(10);
  console.log("✅ client_requests SELECT →", rows.length, "rows");
} catch (e) {
  console.error("❌ client_requests:", e.message);
  if (e.cause) console.error("   cause:", e.cause?.message ?? e.cause);
}

// Test 2: worker_applications
try {
  const rows = await db.select().from(schema.workerApplications).orderBy(desc(schema.workerApplications.createdAt)).limit(10);
  console.log("✅ worker_applications SELECT →", rows.length, "rows");
} catch (e) {
  console.error("❌ worker_applications:", e.message);
  if (e.cause) console.error("   cause:", e.cause?.message ?? e.cause);
}

// Test 3: activity_logs
try {
  const rows = await db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.createdAt)).limit(10);
  console.log("✅ activity_logs SELECT →", rows.length, "rows");
} catch (e) {
  console.error("❌ activity_logs:", e.message);
  if (e.cause) console.error("   cause:", e.cause?.message ?? e.cause);
}

// Test 4: count
try {
  const result = await db.select({ count: sql`count(*)` }).from(schema.clientRequests);
  console.log("✅ count(*) client_requests →", result[0].count);
} catch (e) {
  console.error("❌ count(*):", e.message);
  if (e.cause) console.error("   cause:", e.cause?.message ?? e.cause);
}

await pool.end();
