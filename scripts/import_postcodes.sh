#!/bin/bash
echo "======================================"
echo "SIMD Postcode Import for Pathfinder"
echo "======================================"
echo ""
echo "This will import 227,000+ Scottish postcodes with SIMD data."
echo ""
echo "You need your Supabase database password."
echo "Find it at: Supabase Dashboard > Project Settings > Database > Connection string"
echo ""
read -sp "Enter your database password: " SUPABASE_DB_PASSWORD
export SUPABASE_DB_PASSWORD
echo ""
echo ""
echo "Importing postcodes..."
cd "$(dirname "$0")/.."
node scripts/import_postcodes_v2.js
