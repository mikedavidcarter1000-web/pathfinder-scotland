# Apply a migration and auto-rename the local file if the remote timestamp differs.
#
# Supabase sometimes assigns a different version timestamp than the local filename
# (observed consistently when using the MCP apply_migration tool). This script
# applies the migration via `supabase db push`, queries the actual remote version,
# and renames the local file to match -- eliminating the manual rename step.
#
# Usage:
#   .\scripts\apply-migration.ps1 <migration_filename>
#   .\scripts\apply-migration.ps1 20260424171731_schools_dyw_cpd.sql

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationFile
)

$MigrationDir = "supabase/migrations"
$LocalPath = Join-Path $MigrationDir $MigrationFile

if (-not (Test-Path $LocalPath)) {
    Write-Error "File not found: $LocalPath"
    exit 1
}

# Extract the 14-digit timestamp prefix and the descriptive suffix
if ($MigrationFile -notmatch '^(\d{14})(.+)$') {
    Write-Error "Filename does not start with a 14-digit timestamp: $MigrationFile"
    exit 1
}
$LocalTimestamp = $Matches[1]
$Suffix = $Matches[2]

Write-Host "Applying migration: $MigrationFile"
npx supabase db push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Query the remote for the latest applied migration version.
# --agent no suppresses the JSON envelope the CLI adds in agent-detected contexts.
$QueryResult = npx supabase db query --linked --agent no --output csv `
    "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;" 2>$null

$RemoteTimestamp = ""
if ($QueryResult) {
    $Lines = $QueryResult -split "`n" | Where-Object { $_ -match '^\d{14}' }
    if ($Lines.Count -gt 0) {
        $RemoteTimestamp = [regex]::Match($Lines[0], '\d{14}').Value
    }
}

if (-not $RemoteTimestamp) {
    Write-Warning "Could not retrieve remote timestamp. Run manually:"
    Write-Warning "  npx supabase db query --linked --agent no --output csv `"SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;`""
    exit 0
}

if ($LocalTimestamp -eq $RemoteTimestamp) {
    Write-Host "Timestamps match. No rename needed."
} else {
    $NewFilename = "${RemoteTimestamp}${Suffix}"
    $NewPath = Join-Path $MigrationDir $NewFilename
    Rename-Item $LocalPath $NewPath
    Write-Host "Renamed: $MigrationFile -> $NewFilename"
    Write-Host "Remember to git add the renamed file before committing."
}
