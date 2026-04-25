#!/usr/bin/env node
/* Apply role import SQL via direct Postgres connection. */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) { console.error('Set SUPABASE_DB_PASSWORD env var'); process.exit(1); }

const SQL_PATH = path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_import.sql');
const sql = fs.readFileSync(SQL_PATH, 'utf8');

// Try multiple Supabase pooler endpoints
const endpoints = [
  { host: `aws-0-eu-west-2.pooler.supabase.com`, port: 6543, label: 'eu-west-2 pooler' },
  { host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, label: 'eu-west-1 pooler' },
  { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, label: 'us-east-1 pooler' },
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, label: 'direct DB' },
];

(async () => {
  for (const ep of endpoints) {
    const config = {
      user: ep.host.includes('pooler') ? `postgres.${PROJECT_REF}` : 'postgres',
      password: PASSWORD,
      host: ep.host,
      port: ep.port,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    };
    const client = new Client(config);
    try {
      console.log(`Trying ${ep.label} (${ep.host}:${ep.port})...`);
      await client.connect();
      console.log(`Connected via ${ep.label}.`);
      const r = await client.query('SELECT COUNT(*) AS n FROM career_roles');
      console.log(`Pre-import count: ${r.rows[0].n}`);

      console.log(`Applying SQL (${sql.length} bytes)...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Import committed.');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }

      const r2 = await client.query('SELECT COUNT(*) AS n FROM career_roles');
      console.log(`Post-import count: ${r2.rows[0].n}`);
      const r3 = await client.query('SELECT COUNT(*) AS n FROM role_profiles');
      console.log(`role_profiles count: ${r3.rows[0].n}`);
      const r4 = await client.query('SELECT COUNT(*) AS n FROM career_role_subjects');
      console.log(`career_role_subjects count: ${r4.rows[0].n}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.error(`  ${ep.label} failed: ${e.code || ''} ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
  console.error('All endpoints failed.');
  process.exit(2);
})();
