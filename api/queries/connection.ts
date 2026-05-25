import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: MySql2Database<typeof fullSchema> | null = null;

export function getDb(): MySql2Database<typeof fullSchema> {
  if (!instance) {
    // Strip ssl-mode param which mysql2 doesn't support, use ssl option instead
    const url = env.databaseUrl.replace(/[?&]ssl-mode=[^&]*/i, "").replace(/\?$/, "");
    const connection = mysql.createPool({
      uri: url,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(connection, {
      schema: fullSchema,
      mode: "default",
    });
  }
  return instance;
}
