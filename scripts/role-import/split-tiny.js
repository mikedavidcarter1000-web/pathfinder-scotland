#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SQL = fs.readFileSync(path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_import.sql'), 'utf8');
const OUT_DIR = path.resolve(__dirname, '../../data/role-imports/single-roles');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Split by "-- {title}" comments
const blocks = SQL.split(/\n(?=-- [^\n]+\nINSERT INTO career_roles)/);
blocks.shift(); // header

blocks.forEach((blk, i) => {
  const idx = String(i + 1).padStart(2, '0');
  fs.writeFileSync(path.join(OUT_DIR, `r${idx}.sql`), blk);
});
console.log(`Wrote ${blocks.length} per-role files to ${OUT_DIR}`);
