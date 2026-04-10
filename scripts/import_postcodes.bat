@echo off
echo ======================================
echo SIMD Postcode Import for Pathfinder
echo ======================================
echo.
echo This will import 227,000+ Scottish postcodes with SIMD data.
echo.
echo You need your Supabase database password.
echo Find it at: Supabase Dashboard ^> Project Settings ^> Database ^> Connection string
echo.
set /p SUPABASE_DB_PASSWORD="Enter your database password: "
echo.
echo Importing postcodes...
cd /d "%~dp0.."
node scripts/import_postcodes_v2.js
echo.
pause
