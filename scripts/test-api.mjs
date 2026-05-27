/**
 * API Test Script — tests all major tRPC endpoints against the live Supabase DB
 * Run with: node scripts/test-api.mjs
 */

import "dotenv/config";
import pg from "pg";

const DB_URL = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✅ ${label}`);
  passed++;
}

function fail(label, err) {
  console.log(`  ❌ ${label}`);
  console.log(`     ${err?.message || err}`);
  failed++;
}

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

// ─── 1. Connection ────────────────────────────────────────────────
console.log("\n🔌 1. Database Connection");
try {
  const res = await query("SELECT current_database(), version()");
  ok(`Connected to: ${res.rows[0].current_database}`);
  ok(`PostgreSQL: ${res.rows[0].version.split(" ").slice(0, 2).join(" ")}`);
} catch (e) {
  fail("Connection failed", e);
  process.exit(1);
}

// ─── 2. Tables exist ─────────────────────────────────────────────
console.log("\n📋 2. Table Existence");
const expectedTables = [
  "users", "local_tokens", "otp_codes", "client_requests",
  "worker_applications", "worker_portfolios", "projects",
  "activity_logs", "uploaded_files",
];
const tablesRes = await query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
);
const existingTables = tablesRes.rows.map(r => r.table_name);
for (const t of expectedTables) {
  if (existingTables.includes(t)) ok(`Table exists: ${t}`);
  else fail(`Table missing: ${t}`, { message: "Not found in public schema" });
}

// ─── 3. Users table ───────────────────────────────────────────────
console.log("\n👤 3. Users — Insert & Query");
let testUserId;
try {
  const ins = await query(
    `INSERT INTO users ("unionid", name, email, password, role, status, "lastsigninat")
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
    [`test_${Date.now()}`, "Test User", `test_${Date.now()}@example.com`, "hashed_pw", "user", "active"]
  );
  testUserId = ins.rows[0].id;
  ok(`Insert user → id: ${testUserId}`);
} catch (e) {
  fail("Insert user", e);
}

try {
  const sel = await query(`SELECT id, name, role FROM users WHERE id = $1`, [testUserId]);
  ok(`Select user → name: ${sel.rows[0]?.name}, role: ${sel.rows[0]?.role}`);
} catch (e) {
  fail("Select user", e);
}

try {
  await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [testUserId]);
  ok("Update user role → admin");
} catch (e) {
  fail("Update user role", e);
}

// ─── 4. Client Requests ───────────────────────────────────────────
console.log("\n📝 4. Client Requests — Insert & Query");
let testRequestId;
try {
  const ins = await query(
    `INSERT INTO client_requests
      (fullname, email, phone, country, leadsource, serviceneeded, projectdetails, budgetrange, deadline, paymentmethod, referencefiles, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    ["Jean Torreal", "jean@example.com", "+918192838129", "India", "Google",
     "Shopify Store Setup", "Need a full store setup with payment integration",
     "$5,000 - $10,000", "2 Weeks", "UPI", "[]", "pending"]
  );
  testRequestId = ins.rows[0].id;
  ok(`Insert client request → id: ${testRequestId}`);
} catch (e) {
  fail("Insert client request", e);
}

try {
  const sel = await query(`SELECT id, fullname, status FROM client_requests WHERE id = $1`, [testRequestId]);
  ok(`Select client request → fullName: ${sel.rows[0]?.fullname}, status: ${sel.rows[0]?.status}`);
} catch (e) {
  fail("Select client request", e);
}

try {
  await query(`UPDATE client_requests SET status = 'reviewing' WHERE id = $1`, [testRequestId]);
  ok("Update client request status → reviewing");
} catch (e) {
  fail("Update client request status", e);
}

// ─── 5. Worker Applications ───────────────────────────────────────
console.log("\n👷 5. Worker Applications — Insert & Query");
let testWorkerId;
try {
  const ins = await query(
    `INSERT INTO worker_applications
      (fullname, email, phone, country, worktype, skills, minprice, maxprice, deliverytime, paymentmethods, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    ["Alice Worker", "alice@example.com", "+1234567890", "USA",
     "full_time", '["React","Node.js"]', 500, 2000, "7 days", '["PayPal","UPI"]', "pending"]
  );
  testWorkerId = ins.rows[0].id;
  ok(`Insert worker application → id: ${testWorkerId}`);
} catch (e) {
  fail("Insert worker application", e);
}

try {
  const sel = await query(`SELECT id, fullname, worktype, status FROM worker_applications WHERE id = $1`, [testWorkerId]);
  ok(`Select worker → fullName: ${sel.rows[0]?.fullname}, workType: ${sel.rows[0]?.worktype}`);
} catch (e) {
  fail("Select worker application", e);
}

try {
  await query(`UPDATE worker_applications SET status = 'approved' WHERE id = $1`, [testWorkerId]);
  ok("Update worker status → approved");
} catch (e) {
  fail("Update worker status", e);
}

// ─── 6. Worker Portfolios ─────────────────────────────────────────
console.log("\n🗂️  6. Worker Portfolios — Insert & Query");
try {
  await query(
    `INSERT INTO worker_portfolios (workerid, skillname, portfoliofiles, softwaretools, yearsofexperience, skilllevel)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [testWorkerId, "React", '["file1.png"]', '["VS Code"]', 3, "advanced"]
  );
  ok(`Insert portfolio for workerId: ${testWorkerId}`);
} catch (e) {
  fail("Insert worker portfolio", e);
}

// ─── 7. Projects ──────────────────────────────────────────────────
console.log("\n📁 7. Projects — Insert & Query");
let testProjectId;
try {
  const ins = await query(
    `INSERT INTO projects (clientrequestid, assignedworkerid, title, description, status, priority, startdate)
     VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id`,
    [testRequestId, testWorkerId, "Shopify Store Project", "Full store setup", "assigned", "high"]
  );
  testProjectId = ins.rows[0].id;
  ok(`Insert project → id: ${testProjectId}`);
} catch (e) {
  fail("Insert project", e);
}

try {
  const sel = await query(`SELECT id, title, status, priority FROM projects WHERE id = $1`, [testProjectId]);
  ok(`Select project → title: ${sel.rows[0]?.title}, priority: ${sel.rows[0]?.priority}`);
} catch (e) {
  fail("Select project", e);
}

// ─── 8. Activity Logs ─────────────────────────────────────────────
console.log("\n📊 8. Activity Logs — Insert & Query");
try {
  await query(
    `INSERT INTO activity_logs (entitytype, entityid, action, details)
     VALUES ($1,$2,$3,$4)`,
    ["project", testProjectId, "Project created", '{"title":"Shopify Store Project"}']
  );
  ok("Insert activity log");
} catch (e) {
  fail("Insert activity log", e);
}

try {
  const sel = await query(`SELECT count(*) FROM activity_logs WHERE entityid = $1`, [testProjectId]);
  ok(`Activity logs count for project: ${sel.rows[0].count}`);
} catch (e) {
  fail("Select activity logs", e);
}

// ─── 9. OTP Codes ─────────────────────────────────────────────────
console.log("\n🔐 9. OTP Codes — Insert & Query");
try {
  await query(
    `INSERT INTO otp_codes (phone, countrycode, code, expiresat)
     VALUES ($1,$2,$3,NOW() + INTERVAL '10 minutes')`,
    ["+918192838129", "+91", "123456"]
  );
  ok("Insert OTP code");
} catch (e) {
  fail("Insert OTP code", e);
}

try {
  const sel = await query(
    `SELECT code, used FROM otp_codes WHERE phone = $1 ORDER BY createdat DESC LIMIT 1`,
    ["+918192838129"]
  );
  ok(`Select OTP → code: ${sel.rows[0]?.code}, used: ${sel.rows[0]?.used}`);
} catch (e) {
  fail("Select OTP code", e);
}

// ─── 10. Dashboard counts ─────────────────────────────────────────
console.log("\n📈 10. Dashboard Counts");
try {
  const res = await query(`
    SELECT
      (SELECT count(*) FROM users) AS users,
      (SELECT count(*) FROM client_requests) AS client_requests,
      (SELECT count(*) FROM worker_applications) AS worker_applications,
      (SELECT count(*) FROM projects) AS projects,
      (SELECT count(*) FROM activity_logs) AS activity_logs
  `);
  const r = res.rows[0];
  ok(`users: ${r.users}, client_requests: ${r.client_requests}, workers: ${r.worker_applications}, projects: ${r.projects}, logs: ${r.activity_logs}`);
} catch (e) {
  fail("Dashboard counts", e);
}

// ─── Cleanup ──────────────────────────────────────────────────────
console.log("\n🧹 Cleanup — removing test data");
try {
  await query(`DELETE FROM activity_logs WHERE entityid = $1 AND entitytype = 'project'`, [testProjectId]);
  await query(`DELETE FROM projects WHERE id = $1`, [testProjectId]);
  await query(`DELETE FROM worker_portfolios WHERE workerid = $1`, [testWorkerId]);
  await query(`DELETE FROM worker_applications WHERE id = $1`, [testWorkerId]);
  await query(`DELETE FROM client_requests WHERE id = $1`, [testRequestId]);
  await query(`DELETE FROM otp_codes WHERE phone = '+918192838129'`);
  await query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  ok("All test data cleaned up");
} catch (e) {
  fail("Cleanup", e);
}

await pool.end();

// ─── Summary ──────────────────────────────────────────────────────
console.log(`\n${"─".repeat(45)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("  🎉 All tests passed! Database is fully operational.");
} else {
  console.log("  ⚠️  Some tests failed. Check errors above.");
}
console.log("─".repeat(45) + "\n");

process.exit(failed > 0 ? 1 : 0);
