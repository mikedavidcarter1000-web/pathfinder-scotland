#!/usr/bin/env node
/**
 * Verify colleges and college_articulation data integrity
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  let passed = 0;
  let failed = 0;

  function check(label, condition) {
    if (condition) {
      console.log(`  PASS: ${label}`);
      passed++;
    } else {
      console.log(`  FAIL: ${label}`);
      failed++;
    }
  }

  try {
    // 1. College count
    console.log('\n=== COLLEGES ===');
    const { rows: [{ count: collegeCount }] } = await client.query('SELECT COUNT(*) FROM colleges');
    check(`College count = 24 (got ${collegeCount})`, parseInt(collegeCount) === 24);

    // 2. Articulation count
    console.log('\n=== ARTICULATION ROUTES ===');
    const { rows: [{ count: artCount }] } = await client.query('SELECT COUNT(*) FROM college_articulation');
    check(`Articulation routes >= 80 (got ${artCount})`, parseInt(artCount) >= 80);

    // 3. Regions coverage
    console.log('\n=== REGIONS ===');
    const { rows: regions } = await client.query('SELECT DISTINCT region, COUNT(*) as cnt FROM colleges GROUP BY region ORDER BY region');
    console.log('  Regions:', regions.map(r => `${r.region} (${r.cnt})`).join(', '));
    check(`All regions have >= 1 college`, regions.every(r => parseInt(r.cnt) >= 1));

    // 4. UHI partners
    console.log('\n=== UHI PARTNERS ===');
    const { rows: uhi } = await client.query("SELECT name FROM colleges WHERE uhi_partner = true ORDER BY name");
    console.log('  UHI partners:', uhi.map(u => u.name).join(', '));
    check(`UHI partner count = 8 (got ${uhi.length})`, uhi.length === 8);

    // 5. SWAP colleges
    console.log('\n=== SWAP COLLEGES ===');
    const { rows: swap } = await client.query("SELECT name, swap_hub FROM colleges WHERE has_swap = true ORDER BY swap_hub, name");
    console.log('  SWAP East:', swap.filter(s => s.swap_hub === 'east').map(s => s.name).join(', '));
    console.log('  SWAP West:', swap.filter(s => s.swap_hub === 'west').map(s => s.name).join(', '));
    check(`SWAP colleges exist (got ${swap.length})`, swap.length >= 14);

    // 6. WP articulation routes
    console.log('\n=== WIDENING PARTICIPATION ===');
    const { rows: [{ count: wpCount }] } = await client.query('SELECT COUNT(*) FROM college_articulation WHERE is_widening_participation = true');
    check(`WP routes = 10 (got ${wpCount})`, parseInt(wpCount) === 10);

    // 7. FK integrity — no orphan university references
    console.log('\n=== FK INTEGRITY ===');
    const { rows: orphanUni } = await client.query(`
      SELECT ca.id FROM college_articulation ca
      LEFT JOIN universities u ON ca.university_id = u.id
      WHERE u.id IS NULL
    `);
    check(`No orphan university references (got ${orphanUni.length})`, orphanUni.length === 0);

    const { rows: orphanCol } = await client.query(`
      SELECT ca.id FROM college_articulation ca
      LEFT JOIN colleges c ON ca.college_id = c.id
      WHERE c.id IS NULL
    `);
    check(`No orphan college references (got ${orphanCol.length})`, orphanCol.length === 0);

    // 8. No duplicates
    console.log('\n=== DUPLICATES ===');
    const { rows: dupes } = await client.query(`
      SELECT college_id, university_id, college_qualification, university_degree, COUNT(*)
      FROM college_articulation
      GROUP BY college_id, university_id, college_qualification, university_degree
      HAVING COUNT(*) > 1
    `);
    check(`No duplicate articulation routes (got ${dupes.length})`, dupes.length === 0);

    // 9. Articulation by university
    console.log('\n=== ROUTES BY UNIVERSITY ===');
    const { rows: byUni } = await client.query(`
      SELECT u.name, COUNT(*) as routes
      FROM college_articulation ca
      JOIN universities u ON ca.university_id = u.id
      GROUP BY u.name
      ORDER BY routes DESC
    `);
    byUni.forEach(r => console.log(`  ${r.name}: ${r.routes} routes`));

    // Summary
    console.log(`\n=== SUMMARY ===`);
    console.log(`  ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
