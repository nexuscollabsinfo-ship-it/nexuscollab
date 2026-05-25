const mysql = require('mysql2/promise');
require('dotenv').config();

async function drop() {
  const url = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  const tables = ['uploaded_files','activity_logs','projects','worker_portfolios','worker_applications','client_requests','otp_codes','local_tokens','users'];
  for (const t of tables) {
    await conn.execute(`DROP TABLE IF EXISTS \`${t}\``);
    console.log('Dropped', t);
  }
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('Done');
}

drop().catch(console.error);
