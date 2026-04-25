#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SQL = fs.readFileSync(path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_import.sql'), 'utf8');
const OUT_DIR = path.resolve(__dirname, '../../data/role-imports/batches');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Split by "-- {title}" comments which delimit each role's INSERT block
const blocks = SQL.split(/\n(?=-- [^\n]+\nINSERT INTO career_roles)/);
const intro = blocks.shift(); // initial header before first role
const roles = blocks;
console.log(`Header: ${intro.split('\n').length} lines, role blocks: ${roles.length}`);

const BATCH_SIZE = 7;
let idx = 0;
for (let i = 0; i < roles.length; i += BATCH_SIZE) {
  idx++;
  const chunk = roles.slice(i, i + BATCH_SIZE).join('\n');
  const filename = path.join(OUT_DIR, `batch-${String(idx).padStart(2, '0')}.sql`);
  fs.writeFileSync(filename, chunk);
  console.log(`${filename}: ${chunk.length} bytes, ${roles.slice(i, i + BATCH_SIZE).length} roles`);
}
