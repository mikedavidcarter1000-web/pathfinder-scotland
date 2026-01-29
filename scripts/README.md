# SIMD Postcode Import Scripts

These scripts import 227,066 Scottish postcodes with SIMD (Scottish Index of Multiple Deprivation) data.

## Source Data

- **File:** `simd_postcodes.xlsx`
- **Source:** [Scottish Government SIMD 2020v2](https://www.gov.scot/publications/scottish-index-of-multiple-deprivation-2020v2-postcode-look-up/)
- **Records:** 227,066 postcodes with decile rankings

## Quick Start

### Option 1: Using Supabase API (Recommended)

1. Get your service role key from Supabase Dashboard > Project Settings > API
2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Run:
   ```bash
   npm run db:import-postcodes
   ```

### Option 2: Using Direct PostgreSQL Connection

1. Get your database password from Supabase Dashboard > Project Settings > Database
2. Run:
   ```bash
   # Windows
   set DATABASE_URL=postgresql://postgres.qexfszbhmdducszupyzi:[PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres
   npm run db:import-postcodes:pg

   # Linux/Mac
   DATABASE_URL="postgresql://postgres.qexfszbhmdducszupyzi:[PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres" npm run db:import-postcodes:pg
   ```

### Option 3: Using Supabase Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/20240129000001_simd_postcodes_full.sql`
3. Paste and run (may need to run in chunks if timeout occurs)

### Option 4: CSV Import via Dashboard

1. Go to Supabase Dashboard > Table Editor > simd_postcodes
2. Click "Insert" > "Import data from CSV"
3. Select `data/simd_postcodes.csv`
4. Enable "Upsert" mode

## Scripts

| Script | Description |
|--------|-------------|
| `import_via_api.js` | Uses Supabase JS client with service role key |
| `import_postcodes_v2.js` | Uses pg client with DATABASE_URL |
| `generate_postcode_sql.py` | Generates SQL migration from Excel |
| `generate_postcode_csv.py` | Generates CSV for manual import |
| `import_postcodes.bat` | Windows batch script (prompts for password) |
| `import_postcodes.sh` | Bash script (prompts for password) |

## Data Structure

The import populates the `simd_postcodes` table:

| Column | Type | Description |
|--------|------|-------------|
| postcode | TEXT | Normalized postcode (no spaces, uppercase) |
| simd_decile | INTEGER | SIMD decile (1=most deprived, 10=least deprived) |
| datazone | TEXT | Scottish Government datazone code |

## Verification

After import, verify with:
```sql
SELECT COUNT(*) FROM simd_postcodes;
-- Expected: 227,066

SELECT simd_decile, COUNT(*)
FROM simd_postcodes
GROUP BY simd_decile
ORDER BY simd_decile;
```
