import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  // Test 1: raw insert WITHOUT id (what we want Drizzle to do)
  const r1 = await pool.query(
    `INSERT INTO client_requests ("fullName", email, country, "leadSource", "serviceNeeded", "projectDetails", "budgetRange", deadline, "paymentMethod", "referenceFiles")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    ["Test User", "test@test.com", "India", "Google", "Web Development", "Test project details", "Under $500", "1 Week", "UPI", "[]"]
  );
  console.log("✅ INSERT without id → id =", r1.rows[0].id);

  // Test 2: raw insert WITH id as DEFAULT (what Drizzle bigserial does)
  const r2 = await pool.query(
    `INSERT INTO client_requests (id, "fullName", email, country, "leadSource", "serviceNeeded", "projectDetails", "budgetRange", deadline, "paymentMethod", "referenceFiles")
     VALUES (default, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    ["Test User 2", "test2@test.com", "India", "Google", "Web Development", "Test project details", "Under $500", "1 Week", "UPI", "[]"]
  );
  console.log("✅ INSERT with id=default → id =", r2.rows[0].id);

  // Cleanup
  await pool.query(`DELETE FROM client_requests WHERE email IN ('test@test.com','test2@test.com')`);
  console.log("✅ Cleanup done");
} catch (e) {
  console.error("❌ FAILED:", e.message);
}

await pool.end();
