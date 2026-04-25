#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_complete.json');
const SQL_OUT = path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_import.sql');
const REPORT = path.resolve(__dirname, '../../data/role-imports/pathfinder_missing_roles_report.md');

const SUBJECTS = {
  'Practical Cookery': 'c7964cc3-c3af-402c-bef8-f011dfe8c10a',
  'Health and Food Technology': '2b845229-113b-45c7-9b7f-a5025e0f8b76',
  'English': 'df347726-8ceb-4313-aba9-d5719741339f',
  'Business Management': '0efd79af-f322-4470-8d0f-4ca945f0a5bf',
  'Administration and IT': 'cab757a4-c72b-40e2-b208-8ff1d9ba5e23',
  'Mathematics': '2ecc0262-f34e-4679-9a28-11eaec202d51',
  'Modern Studies': 'eec9f0da-e33c-48ba-b299-1e0f94f7164d',
  'Geography': '46ba1b5b-8298-4c69-9b09-85db8b9fb64d',
  'Engineering Science': 'e6cfafa5-3bf6-4141-9aea-a61eb4a3e9d0',
  'Design and Manufacture': '82ba03fe-8d18-4d73-806b-c6d44751d9df',
  'Chemistry': 'a790b5d4-ee6e-4249-bcd5-7062efb440e4',
  'Biology': '967e072b-1565-4faf-8e22-78238867154e',
  'Physical Education': '482ccd25-adb2-4304-8fa8-372c2db3c40b',
  'Computing Science': '730698ab-88b2-4630-b26d-652591a9ba0d',
  'Physics': '57a26d11-72ba-4263-a778-41f6cf0b9615',
  'Hospitality: Practical Cake Craft': 'ed81b693-6610-4348-83f1-5ab3b9b1a1db',
  'Art and Design': 'aa5da5d2-70a7-46d3-9050-95d10ebde266',
  'Environmental Science': '263b6a25-c417-4e7d-8f4f-cc9d7b6e13a6',
  'Sport and Fitness': '44c9c897-511c-45c2-8131-2613c6bbaba8',
  'Applied Science': '8f68b20d-482b-474c-a61f-a64f9aabc168',
  'Practical Woodworking': 'ccdc2cb0-71e9-459f-b964-7188787a9085',
  'Psychology': '0b55c723-6048-4835-b790-5a993895b4bd',
  'Economics': '345767c1-d411-492d-8d80-aa16d25f6aec',
  'Human Biology': '2a93fff3-e006-4202-aa97-e8941b65d318',
};

const MATURITY = { foundational: 'foundational', intermediate: 'intermediate', specialised: 'specialised', established: 'intermediate' };

const STRESS = { Low: 'Low', Moderate: 'Moderate', High: 'High', 'Very high': 'Very High', 'Very High': 'Very High' };
const PHYSICAL = { Low: 'Light', Moderate: 'Moderate', High: 'Heavy', Sedentary: 'Sedentary', Light: 'Light', Heavy: 'Heavy', 'Very high': 'Heavy' };
const HOURS = { Standard: 'Standard', Shifts: 'Shifts', Irregular: 'Irregular', Seasonal: 'Seasonal', 'Early starts': 'Shifts', Extended: 'Irregular', Flexible: 'Irregular', 'Standard / Shifts': 'Shifts' };
const ON_CALL = { Never: 'Never', Occasional: 'Occasional', Regular: 'Regular', Sometimes: 'Occasional', Yes: 'Regular' };
const TRAVEL = { None: 'None', Local: 'Local', Regional: 'Regional', National: 'National', International: 'International', Regular: 'Regional', Occasional: 'Local' };
const LOCATION = (v) => {
  if (!v) return null;
  const norm = v.toLowerCase();
  if (norm === 'office') return 'Office';
  if (norm === 'site') return 'Site';
  if (norm === 'hybrid') return 'Hybrid';
  if (norm === 'home') return 'Home';
  if (norm === 'multiple') return 'Multiple';
  if (norm === 'outdoor') return 'Outdoor';
  if (norm === 'mobile') return 'Multiple';
  if (norm === 'factory') return 'Site';
  if (norm.includes('outdoor')) return 'Outdoor';
  if (norm.includes('hybrid')) return 'Hybrid';
  if (norm.includes('/') || norm.includes('campus')) return 'Multiple';
  if (norm.includes('office')) return 'Office';
  if (norm.includes('site') || norm.includes('classroom') || norm.includes('workshop') || norm.includes('factory')) return 'Site';
  return 'Site';
};
const TEAM = { 'Mostly team': 'Mostly team', 'Mostly solo': 'Mostly solo', Mixed: 'Mixed', Mix: 'Mixed', Solo: 'Mostly solo' };
const DEALS = { Yes: 'Yes', No: 'No', Sometimes: 'Yes' };
const VULN = { Yes: 'Yes', No: 'No', Sometimes: 'Sometimes' };
const CUSTOMER = { Yes: 'Yes', No: 'No' };
const DRESS = (v) => {
  if (!v) return null;
  const n = v.toLowerCase();
  if (n.includes('ppe')) return 'PPE required';
  if (n.includes('uniform') || n.includes('scrubs') || n.includes('sportswear') || n.includes('professional')) return 'Uniform';
  if (n.includes('workwear') || n.includes('outdoor')) return 'Uniform';
  if (n.includes('smart')) return 'Smart';
  if (n === 'casual' || n === 'none') return 'None';
  return 'Smart';
};
const DRIVING = { No: 'No', Yes: 'Essential', Sometimes: 'Helpful', Helpful: 'Helpful', Essential: 'Essential' };
const CONTRACT = { Permanent: 'Permanent', 'Fixed-term': 'Fixed-term', Freelance: 'Freelance', 'Zero hours': 'Zero hours', Seasonal: 'Seasonal', 'Self-employed': 'Freelance' };
const SECURITY = { 'Very secure': 'Very secure', Secure: 'Secure', Moderate: 'Moderate', Variable: 'Variable', Insecure: 'Variable' };
const UNION = { Strong: 'Strong', Present: 'Present', Rare: 'Rare', None: 'None', Sometimes: 'Present', Common: 'Present', Yes: 'Strong' };
const SELFEMP = { Common: 'Common', Possible: 'Possible', Rare: 'Rare', No: 'No', 'Very common': 'Common', 'By definition': 'Common', 'Almost always': 'Common', None: 'No' };
const PROGRESSION = { Fast: 'Fast', Moderate: 'Moderate', Slow: 'Slow', Flat: 'Flat', Variable: 'Moderate' };
const SICK = { 'Full contractual': 'Full contractual', 'Contractual then statutory': 'Contractual then statutory', 'Statutory only': 'Statutory only', None: 'None', 'Occupational sick pay': 'Contractual then statutory', 'Company scheme': 'Contractual then statutory', Variable: 'Statutory only' };
const TIPS = { Yes: 'Yes', No: 'No', Sometimes: 'Yes' };
const PENSION = { Excellent: 'Excellent', Good: 'Good', Standard: 'Standard', Poor: 'Poor', Adequate: 'Standard', Variable: 'Standard' };
const WLB = { Excellent: 'Excellent', Good: 'Good', Variable: 'Variable', Challenging: 'Challenging', Poor: 'Challenging' };
const REMOTE = { Yes: 'Yes', 'Hybrid only': 'Hybrid only', Rarely: 'Rarely', No: 'No', Sometimes: 'Rarely' };
const COMPETITION = { Open: 'Open', Moderate: 'Moderate', Competitive: 'Competitive', 'Highly competitive': 'Highly competitive', 'Very competitive': 'Highly competitive' };
const CRIMINAL = { None: 'None', 'May affect': 'May affect', 'Likely to bar': 'Likely to bar', 'Will bar': 'Will bar', Minimal: 'None', Significant: 'Likely to bar' };
const VISA = { None: 'None', 'Some roles restricted': 'Some roles restricted', 'British citizenship required': 'British citizenship required', Sometimes: 'Some roles restricted', 'May apply': 'Some roles restricted', 'British / Commonwealth citizen requirement': 'British citizenship required' };

// Per-role overrides for disclosure_checks based on the notes content (since "Required"/"Sometimes" alone is ambiguous)
const DISCLOSURE_BY_SLUG = {
  'kitchen-catering-assistant': 'Basic',
  'cleaner-domestic-worker': 'Basic',
  'service-business-manager': 'PVG',
  'government-admin-officer': 'Basic',
  'sales-business-development-manager': 'None',
  'postal-worker-courier': 'None',
  'sales-supervisor': 'None',
  'food-drink-process-operative': 'None',
  'it-operations-technician': 'Security Clearance',
  'production-manager-manufacturing': 'None',
  'security-guard': 'Enhanced',
  'local-government-admin': 'Basic',
  'financial-admin-clerk': 'None',
  'education-professional-specialist': 'PVG',
  'pensions-insurance-clerk': 'None',
  'vocational-trainer-instructor': 'PVG',
  'hairdresser-barber': 'None',
  'customer-service-manager': 'None',
  'financial-manager-director': 'None',
  'gardener-landscape-gardener': 'None',
  'retail-cashier': 'None',
  'chief-executive-senior-official': 'Basic',
  'property-estate-manager': 'None',
  'pharmacy-dispenser': 'None',
  'records-clerk': 'Basic',
  'personal-assistant-secretary': 'None',
  'nursing-auxiliary': 'PVG',
  'higher-education-lecturer': 'None',
  'bar-staff': 'None',
  'cook': 'PVG',
  'office-manager': 'None',
  'cleaning-supervisor': 'PVG',
  'shopkeeper-retail-proprietor': 'None',
  'buyer-procurement-officer': 'None',
  'sports-leisure-assistant': 'PVG',
  'animal-care-worker': 'None',
  'beautician-beauty-therapist': 'None',
  'firefighter': 'Enhanced',
  'bus-coach-driver': 'Enhanced',
  'caretaker-janitor': 'PVG',
  'health-and-safety-officer': 'None',
  'driving-instructor': 'Enhanced',
};

function uuidv4() { return crypto.randomUUID(); }
function sql(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}
function look(map, v, field, slug, warn) {
  if (v === null || v === undefined) return null;
  const r = map[v];
  if (!r) { warn.push(`[${slug}] ${field}: unknown value "${v}" -- using NULL`); return null; }
  return r;
}

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const warnings = [];
const subjectMisses = [];
const lines = [];
lines.push('-- Generated import for 42 missing career roles');
lines.push('-- Source: pathfinder_missing_roles_complete.json');
lines.push('-- Generated: 2026-04-25');
lines.push('');

for (const role of data.roles) {
  const cr = role.career_role;
  const rp = role.role_profile;
  const id = uuidv4();

  // career_roles INSERT
  lines.push(`-- ${cr.title}`);
  lines.push(`INSERT INTO career_roles (`);
  lines.push(`  id, career_sector_id, title, slug, ai_description, is_new_ai_role,`);
  lines.push(`  growth_outlook, soc_code_2020, salary_median_scotland, salary_entry_uk,`);
  lines.push(`  salary_median_uk, salary_experienced_uk, salary_source, salary_last_updated,`);
  lines.push(`  salary_needs_verification, salary_notes, salary_entry, salary_experienced,`);
  lines.push(`  ai_rating_2030_2035, ai_rating_2040_2045, robotics_rating_2030_2035,`);
  lines.push(`  robotics_rating_2040_2045, robotics_description, maturity_tier`);
  lines.push(`) VALUES (`);
  lines.push(`  ${sql(id)}, ${sql(cr.career_sector_id)}, ${sql(cr.title)}, ${sql(cr.slug)},`);
  lines.push(`  ${sql(cr.ai_description)}, ${sql(cr.is_new_ai_role)},`);
  lines.push(`  ${sql(cr.growth_outlook)}, ${sql(cr.soc_code_2020)}, ${sql(cr.salary_median_scotland)}, ${sql(cr.salary_entry_uk)},`);
  lines.push(`  ${sql(cr.salary_median_uk)}, ${sql(cr.salary_experienced_uk)}, ${sql(cr.salary_source)}, ${sql(cr.salary_last_updated)},`);
  lines.push(`  ${sql(cr.salary_needs_verification)}, ${sql(cr.salary_notes)}, ${sql(cr.salary_entry)}, ${sql(cr.salary_experienced)},`);
  lines.push(`  ${sql(cr.ai_rating_2030_2035)}, ${sql(cr.ai_rating_2040_2045)}, ${sql(cr.robotics_rating_2030_2035)},`);
  lines.push(`  ${sql(cr.robotics_rating_2040_2045)}, ${sql(cr.robotics_description)}, ${sql(MATURITY[cr.maturity_tier] || 'foundational')}`);
  lines.push(`);`);

  // role_profiles INSERT
  const disclosure = DISCLOSURE_BY_SLUG[cr.slug] !== undefined ? DISCLOSURE_BY_SLUG[cr.slug] : 'None';
  lines.push(`INSERT INTO role_profiles (`);
  lines.push(`  career_role_id, description, day_in_the_life, career_progression,`);
  lines.push(`  stress_level, physical_demands, hours_pattern, on_call, travel_requirement, working_location,`);
  lines.push(`  antisocial_hours, emotionally_demanding, emotionally_demanding_notes,`);
  lines.push(`  deals_with_public, works_with_vulnerable, team_vs_solo, customer_facing,`);
  lines.push(`  disclosure_checks, disclosure_notes, dress_code, driving_licence, minimum_age,`);
  lines.push(`  health_fitness_requirements, contract_type, job_security, union_presence,`);
  lines.push(`  self_employment_viability, salary_progression_speed, sick_pay, bonus_payments,`);
  lines.push(`  tips_or_commission, pension_quality, unpaid_overtime, work_life_balance,`);
  lines.push(`  remote_hybrid_realistic, entry_cost_notes, competition_level, criminal_record_impact,`);
  lines.push(`  geographic_availability, geographic_notes, visa_restrictions,`);
  lines.push(`  min_entry_qualification, typical_entry_qualification,`);
  lines.push(`  typical_starting_salary_gbp, typical_experienced_salary_gbp,`);
  lines.push(`  typical_entry_age, typical_hours_per_week`);
  lines.push(`) VALUES (`);
  lines.push(`  ${sql(id)}, ${sql(rp.description)}, ${sql(rp.day_in_the_life)}, ${sql(rp.career_progression)},`);
  lines.push(`  ${sql(look(STRESS, rp.stress_level, 'stress_level', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(PHYSICAL, rp.physical_demands, 'physical_demands', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(HOURS, rp.hours_pattern, 'hours_pattern', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(ON_CALL, rp.on_call, 'on_call', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(TRAVEL, rp.travel_requirement, 'travel_requirement', cr.slug, warnings))},`);
  lines.push(`  ${sql(LOCATION(rp.working_location))},`);
  lines.push(`  ${sql(rp.antisocial_hours)},`);
  lines.push(`  ${sql(rp.emotionally_demanding)}, ${sql(rp.emotionally_demanding_notes)},`);
  lines.push(`  ${sql(look(DEALS, rp.deals_with_public, 'deals_with_public', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(VULN, rp.works_with_vulnerable, 'works_with_vulnerable', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(TEAM, rp.team_vs_solo, 'team_vs_solo', cr.slug, warnings))},`);
  lines.push(`  ${sql(rp.customer_facing)},`);
  lines.push(`  ${sql(disclosure)}, ${sql(rp.disclosure_notes)}, ${sql(DRESS(rp.dress_code))},`);
  lines.push(`  ${sql(look(DRIVING, rp.driving_licence, 'driving_licence', cr.slug, warnings))}, ${sql(rp.minimum_age)},`);
  lines.push(`  ${sql(rp.health_fitness_requirements)},`);
  lines.push(`  ${sql(look(CONTRACT, rp.contract_type, 'contract_type', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(SECURITY, rp.job_security, 'job_security', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(UNION, rp.union_presence, 'union_presence', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(SELFEMP, rp.self_employment_viability, 'self_employment_viability', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(PROGRESSION, rp.salary_progression_speed, 'salary_progression_speed', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(SICK, rp.sick_pay, 'sick_pay', cr.slug, warnings))}, ${sql(rp.bonus_payments)},`);
  lines.push(`  ${sql(look(TIPS, rp.tips_or_commission, 'tips_or_commission', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(PENSION, rp.pension_quality, 'pension_quality', cr.slug, warnings))}, ${sql(rp.unpaid_overtime)},`);
  lines.push(`  ${sql(look(WLB, rp.work_life_balance, 'work_life_balance', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(REMOTE, rp.remote_hybrid_realistic, 'remote_hybrid_realistic', cr.slug, warnings))}, ${sql(rp.entry_cost_notes)},`);
  lines.push(`  ${sql(look(COMPETITION, rp.competition_level, 'competition_level', cr.slug, warnings))},`);
  lines.push(`  ${sql(look(CRIMINAL, rp.criminal_record_impact, 'criminal_record_impact', cr.slug, warnings))},`);
  lines.push(`  ${sql(rp.geographic_availability)}, ${sql(rp.geographic_notes)},`);
  lines.push(`  ${sql(look(VISA, rp.visa_restrictions, 'visa_restrictions', cr.slug, warnings))},`);
  lines.push(`  ${sql(rp.min_entry_qualification)}::entry_qualification,`);
  lines.push(`  ${sql(rp.typical_entry_qualification)}::entry_qualification,`);
  lines.push(`  ${sql(rp.typical_starting_salary_gbp)}, ${sql(rp.typical_experienced_salary_gbp)},`);
  lines.push(`  ${sql(rp.typical_entry_age)}, ${sql(rp.typical_hours_per_week)}`);
  lines.push(`);`);

  // career_role_subjects
  for (const s of role.subjects || []) {
    const sid = SUBJECTS[s.name];
    if (!sid) {
      subjectMisses.push(`[${cr.slug}] subject "${s.name}" not found in subjects table -- skipped`);
      continue;
    }
    lines.push(`INSERT INTO career_role_subjects (career_role_id, subject_id, relevance) VALUES (${sql(id)}, ${sql(sid)}, ${sql(s.relevance)});`);
  }

  lines.push('');
}

fs.writeFileSync(SQL_OUT, lines.join('\n'));

const report = [
  '# Role Import Generation Report',
  '',
  `Generated: 2026-04-25`,
  `Source: ${SRC}`,
  `SQL output: ${SQL_OUT}`,
  '',
  `## Summary`,
  `- Roles processed: ${data.roles.length}`,
  `- career_roles INSERTs: ${data.roles.length}`,
  `- role_profiles INSERTs: ${data.roles.length}`,
  `- career_role_subjects INSERTs: ${data.roles.reduce((n, r) => n + (r.subjects || []).filter(s => SUBJECTS[s.name]).length, 0)}`,
  `- Subjects skipped (unmatched): ${subjectMisses.length}`,
  `- Value-mapping warnings: ${warnings.length}`,
  '',
  '## Subject misses',
  subjectMisses.length === 0 ? '_None._' : subjectMisses.map(s => `- ${s}`).join('\n'),
  '',
  '## Value-mapping warnings',
  warnings.length === 0 ? '_None._' : warnings.map(s => `- ${s}`).join('\n'),
];
fs.writeFileSync(REPORT, report.join('\n'));

console.log(`Wrote ${SQL_OUT}`);
console.log(`Roles: ${data.roles.length}, subject misses: ${subjectMisses.length}, warnings: ${warnings.length}`);
