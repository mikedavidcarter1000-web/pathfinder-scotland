"""
Generate ASHE salary population SQL migration for career_roles.

Data sources:
- soc-mapping-corrected.csv: role_id -> SOC 2020 mapping (user-approved)
- ashe-2025-scotland.json: Table 15 regional data (Scotland only has p50)
- ashe-2025-uk.json: Table 14 UK-wide data (p25, p50, p75)

Key finding: Scotland ASHE Table 15 only publishes medians (p50).
Zero p25/p75 values exist for any SOC code in the Scotland dataset.
Strategy: Use Scotland p50 for median, UK p25/p75 for entry/experienced.
"""

import csv
import json
import math
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
OUTPUT = SCRIPT_DIR.parent.parent / "supabase" / "migrations" / "20260417200002_ashe_salary_populate.sql"

# --- Helpers ---

def round500(value, floor=12000):
    """Round to nearest 500, with a minimum floor."""
    if value is None:
        return None
    rounded = round(value / 500) * 500
    return max(rounded, floor)


def fmt_gbp(value):
    """Format integer as £XX,XXX for TEXT column storage."""
    if value is None:
        return None
    return f"£{value:,}"


def escape_sql(s):
    """Escape single quotes for SQL strings."""
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def sql_int(v):
    return str(v) if v is not None else "NULL"


# --- Load data ---

with open(SCRIPT_DIR / "soc-mapping-corrected.csv", "r") as f:
    mappings = list(csv.DictReader(f))

with open(SCRIPT_DIR / "ashe-2025-scotland.json", "r") as f:
    scot = json.load(f)

with open(SCRIPT_DIR / "ashe-2025-uk.json", "r") as f:
    uk = json.load(f)

# --- Generate SQL ---

lines = []
lines.append("-- ============================================")
lines.append("-- ASHE 2025 salary population for career_roles")
lines.append("-- Migration: 20260417200002")
lines.append("--")
lines.append("-- Source: ONS ASHE 2025 (Provisional)")
lines.append("--   Table 14: UK-wide p25/p50/p75 by SOC 2020 (4-digit)")
lines.append("--   Table 15: Scotland p50 by SOC 2020 (4-digit)")
lines.append("--")
lines.append("-- Scotland Table 15 only publishes medians (p50).")
lines.append("-- p25/p75 percentiles are universally suppressed in the")
lines.append("-- regional dataset due to sample-size constraints.")
lines.append("-- Therefore: salary_entry uses UK p25, salary_experienced uses UK p75,")
lines.append("-- and salary_median_scotland stores Scotland p50 where available.")
lines.append("--")
lines.append("-- Rounding: all GBP values rounded to nearest £500, floor £12,000.")
lines.append("-- ============================================")
lines.append("")
lines.append("BEGIN;")
lines.append("")

stats = {
    "scot_median_uk_percentiles": 0,
    "uk_fallback": 0,
    "uk_partial": 0,
    "no_data": 0,
    "total": len(mappings),
}

regional_premium_notes = []

for row in mappings:
    role_id = row["role_id"]
    title = row["role_title"]
    soc = row["proposed_soc_code"].strip()
    confidence = row["confidence"]

    s = scot.get(soc, {})
    u = uk.get(soc, {})

    sp50 = s.get("p50")
    up25 = u.get("p25")
    up50 = u.get("p50")
    up75 = u.get("p75")

    # Apply rounding
    sp50_r = round500(sp50) if sp50 is not None else None
    up25_r = round500(up25) if up25 is not None else None
    up50_r = round500(up50) if up50 is not None else None
    up75_r = round500(up75) if up75 is not None else None

    lines.append(f"-- {title} (SOC {soc}, confidence: {confidence})")

    if up25_r is not None and up75_r is not None:
        # We have UK p25 + p75 for entry/experienced
        salary_entry_text = fmt_gbp(up25_r)
        salary_experienced_text = fmt_gbp(up75_r)
        salary_median_scotland = sp50_r  # may be None
        salary_entry_uk = up25_r
        salary_median_uk = up50_r
        salary_experienced_uk = up75_r
        needs_verification = False
        notes_parts = []

        if sp50_r is not None:
            source = "ONS ASHE 2025 (Scotland median + UK percentiles)"
            notes_parts.append(
                "Scotland ASHE Table 15 provides median only (p25/p75 suppressed). "
                "Entry and experienced figures use UK-wide percentiles from Table 14."
            )
            stats["scot_median_uk_percentiles"] += 1

            # Task 5: Regional premium check
            if up50_r is not None and sp50_r is not None and up50_r > 0:
                pct_diff = ((sp50_r - up50_r) / up50_r) * 100
                if pct_diff < -10:
                    note = (
                        f"Scotland median pay for this role is typically "
                        f"{abs(round(pct_diff))}% below the UK average. "
                        f"London-based roles may pay significantly more."
                    )
                    notes_parts.append(note)
                    regional_premium_notes.append((title, round(pct_diff)))
                elif pct_diff > 5:
                    # Scotland pays notably more (less common)
                    note = (
                        f"Scotland median pay for this role is competitive with "
                        f"or above the UK average (approx. +{round(pct_diff)}%), "
                        f"likely driven by sector demand."
                    )
                    notes_parts.append(note)
                    regional_premium_notes.append((title, round(pct_diff)))
        else:
            source = "ONS ASHE 2025 (UK fallback — Scotland data suppressed)"
            needs_verification = True
            notes_parts.append(
                "Scotland-specific figures suppressed in ASHE 2025; "
                "UK figures used. Review against SDS Labour Market Insights before pilot."
            )
            stats["uk_fallback"] += 1

        if confidence == "low":
            notes_parts.append(
                f"SOC mapping confidence: low. "
                f"Verify SOC {soc} is appropriate for this role."
            )
            needs_verification = True

        salary_notes = " ".join(notes_parts) if notes_parts else None

        lines.append(f"UPDATE public.career_roles SET")
        lines.append(f"  soc_code_2020 = '{soc}',")
        lines.append(f"  salary_entry = {escape_sql(salary_entry_text)},")
        lines.append(f"  salary_experienced = {escape_sql(salary_experienced_text)},")
        lines.append(f"  salary_median_scotland = {sql_int(salary_median_scotland)},")
        lines.append(f"  salary_entry_uk = {sql_int(salary_entry_uk)},")
        lines.append(f"  salary_median_uk = {sql_int(salary_median_uk)},")
        lines.append(f"  salary_experienced_uk = {sql_int(salary_experienced_uk)},")
        lines.append(f"  salary_source = {escape_sql(source)},")
        lines.append(f"  salary_needs_verification = {str(needs_verification).lower()},")
        lines.append(f"  salary_notes = {escape_sql(salary_notes)},")
        lines.append(f"  salary_last_updated = CURRENT_DATE")
        lines.append(f"WHERE id = '{role_id}';")
        lines.append("")

    elif up25_r is not None or up50_r is not None or up75_r is not None:
        # Partial UK data — use what we have
        salary_entry_text = fmt_gbp(up25_r) if up25_r is not None else None
        salary_experienced_text = fmt_gbp(up75_r) if up75_r is not None else None
        salary_median_scotland = sp50_r
        salary_entry_uk = up25_r
        salary_median_uk = up50_r
        salary_experienced_uk = up75_r
        source = "ONS ASHE 2025 (UK — partial data)"
        notes = (
            "Only partial ASHE data available for this SOC code. "
            "Some salary percentiles suppressed due to sample size. "
            "Manual review recommended."
        )
        if confidence == "low":
            notes += f" SOC mapping confidence: low. Verify SOC {soc} is appropriate."

        stats["uk_partial"] += 1

        set_clauses = [f"  soc_code_2020 = '{soc}'"]
        if salary_entry_text:
            set_clauses.append(f"  salary_entry = {escape_sql(salary_entry_text)}")
        if salary_experienced_text:
            set_clauses.append(f"  salary_experienced = {escape_sql(salary_experienced_text)}")
        set_clauses.append(f"  salary_median_scotland = {sql_int(salary_median_scotland)}")
        set_clauses.append(f"  salary_entry_uk = {sql_int(salary_entry_uk)}")
        set_clauses.append(f"  salary_median_uk = {sql_int(salary_median_uk)}")
        set_clauses.append(f"  salary_experienced_uk = {sql_int(salary_experienced_uk)}")
        set_clauses.append(f"  salary_source = {escape_sql(source)}")
        set_clauses.append(f"  salary_needs_verification = true")
        set_clauses.append(f"  salary_notes = {escape_sql(notes)}")
        set_clauses.append(f"  salary_last_updated = CURRENT_DATE")

        lines.append(f"UPDATE public.career_roles SET")
        lines.append(",\n".join(set_clauses))
        lines.append(f"WHERE id = '{role_id}';")
        lines.append("")

    else:
        # No ASHE data at all
        stats["no_data"] += 1
        notes = (
            f"No ASHE 2025 data available for SOC {soc} "
            f"({u.get('description', s.get('description', 'unknown'))}). "
            f"Existing salary estimates retained. Manual review required."
        )
        if confidence == "low":
            notes += f" SOC mapping confidence: low."

        lines.append(f"UPDATE public.career_roles SET")
        lines.append(f"  soc_code_2020 = '{soc}',")
        lines.append(f"  salary_needs_verification = true,")
        lines.append(f"  salary_notes = {escape_sql(notes)},")
        lines.append(f"  salary_last_updated = CURRENT_DATE")
        lines.append(f"WHERE id = '{role_id}';")
        lines.append("")

lines.append("COMMIT;")

# Write migration file
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"Migration written to: {OUTPUT}")
print(f"\nStats:")
print(f"  Scotland median + UK percentiles: {stats['scot_median_uk_percentiles']}")
print(f"  UK fallback (Scotland suppressed): {stats['uk_fallback']}")
print(f"  UK partial data:                   {stats['uk_partial']}")
print(f"  No ASHE data:                      {stats['no_data']}")
print(f"  Total:                             {stats['total']}")
print(f"\nRegional premium notes added: {len(regional_premium_notes)}")
for title, pct in sorted(regional_premium_notes, key=lambda x: x[1]):
    direction = "below" if pct < 0 else "above"
    print(f"  {title}: {pct:+d}% ({direction} UK)")
