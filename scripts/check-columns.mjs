import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const res = await pool.query(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`);

let currentTable = "";
for (const row of res.rows) {
  if (row.table_name !== currentTable) {
    currentTable = row.table_name;
    console.log(`\n[${currentTable}]`);
  }
  console.log(`  ${row.column_name} (${row.data_type})`);
}

await pool.end();
