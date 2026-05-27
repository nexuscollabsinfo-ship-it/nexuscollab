import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";

async function dropTables() {
  const db = getDb();
  await db.execute(sql`DROP TABLE IF EXISTS uploaded_files CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS activity_logs CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS projects CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS worker_portfolios CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS worker_applications CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS client_requests CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS otp_codes CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS local_tokens CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
  // Drop enums
  await db.execute(sql`DROP TYPE IF EXISTS user_role CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS user_status CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS token_type CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS client_request_status CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS worker_work_type CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS worker_status CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS skill_level CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS project_status CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS project_priority CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS activity_entity_type CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS uploaded_file_entity_type CASCADE`);
  console.log("All tables and types dropped successfully");
}

dropTables().catch(console.error);
