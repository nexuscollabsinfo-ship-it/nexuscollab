import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// Read DATABASE_URL fresh every time (no module-level singleton)
// so Vite HMR picks up .env changes without a full restart.
function createPool(): pg.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  return new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

// One pool per process — recreated if DATABASE_URL changes
let _pool: pg.Pool | null = null;
let _poolUrl: string | null = null;

export function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL ?? "";
  // If URL changed (e.g. after .env edit + HMR), recreate the pool
  if (!_pool || _poolUrl !== url) {
    if (_pool) {
      _pool.end().catch(() => {});
    }
    _pool = createPool();
    _poolUrl = url;
    _pool.on("error", (err) => console.error("[DB Pool Error]", err.message));
    console.log("[DB] Pool created →", url.replace(/:([^:@]+)@/, ":***@"));
  }
  return _pool;
}

let _db: NodePgDatabase<typeof fullSchema> | null = null;
let _dbUrl: string | null = null;

export function getDb(): NodePgDatabase<typeof fullSchema> {
  const url = process.env.DATABASE_URL ?? "";
  if (!_db || _dbUrl !== url) {
    _db = drizzle(getPool(), { schema: fullSchema });
    _dbUrl = url;
  }
  return _db;
}

/** Run a raw parameterized query and return rows */
export async function rawQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(sql, params);
  return result.rows as T[];
}

/** Insert a row and return the generated id */
export async function insertReturningId(
  table: string,
  columns: string[],
  values: unknown[]
): Promise<number> {
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) RETURNING id`;
  const result = await getPool().query(query, values);
  return result.rows[0].id as number;
}
