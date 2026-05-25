import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";

async function dropTables() {
  const db = getDb();
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`DROP TABLE IF EXISTS uploaded_files`);
  await db.execute(sql`DROP TABLE IF EXISTS activity_logs`);
  await db.execute(sql`DROP TABLE IF EXISTS projects`);
  await db.execute(sql`DROP TABLE IF EXISTS worker_portfolios`);
  await db.execute(sql`DROP TABLE IF EXISTS worker_applications`);
  await db.execute(sql`DROP TABLE IF EXISTS client_requests`);
  await db.execute(sql`DROP TABLE IF EXISTS otp_codes`);
  await db.execute(sql`DROP TABLE IF EXISTS local_tokens`);
  await db.execute(sql`DROP TABLE IF EXISTS users`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
  console.log("All tables dropped successfully");
}

dropTables().catch(console.error);
