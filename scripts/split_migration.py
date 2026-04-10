#!/usr/bin/env python3
"""
Split the large SIMD postcode migration into smaller chunks
that can be executed in the Supabase SQL Editor.
"""

import os
import re

def main():
    input_file = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations', '20240129000001_simd_postcodes_full.sql')
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'sql_chunks')

    os.makedirs(output_dir, exist_ok=True)

    print(f"Reading: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract individual INSERT statements
    # Pattern: INSERT INTO ... ON CONFLICT ...;
    pattern = r'(INSERT INTO simd_postcodes \(postcode, simd_decile, datazone\) VALUES\n.*?\nON CONFLICT.*?;)'
    inserts = re.findall(pattern, content, re.DOTALL)

    print(f"Found {len(inserts)} INSERT statements")

    # Create chunk files (combine multiple INSERTs per file)
    chunk_size = 10  # 10 INSERT statements per file (10,000 rows per file)
    chunk_num = 1

    # First, create the DELETE file
    delete_file = os.path.join(output_dir, '00_delete_existing.sql')
    with open(delete_file, 'w', encoding='utf-8') as f:
        f.write("-- Run this FIRST to delete existing sample postcodes\n")
        f.write("DELETE FROM simd_postcodes;\n")
    print(f"Created: {delete_file}")

    # Create chunked insert files
    for i in range(0, len(inserts), chunk_size):
        chunk = inserts[i:i+chunk_size]
        chunk_file = os.path.join(output_dir, f'{chunk_num:02d}_postcodes.sql')

        with open(chunk_file, 'w', encoding='utf-8') as f:
            f.write(f"-- SIMD Postcodes Chunk {chunk_num}\n")
            f.write(f"-- Rows: {i+1} to {min(i+chunk_size, len(inserts))} of {len(inserts)} batches\n\n")
            for insert in chunk:
                f.write(insert)
                f.write("\n\n")

        print(f"Created: {chunk_file}")
        chunk_num += 1

    # Create indexes file
    index_file = os.path.join(output_dir, f'{chunk_num:02d}_indexes.sql')
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write("-- Run this LAST to ensure indexes exist\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_simd_postcodes_postcode ON simd_postcodes(postcode);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_simd_postcodes_decile ON simd_postcodes(simd_decile);\n")
        f.write("\n-- Verify count\n")
        f.write("SELECT COUNT(*) as total_postcodes FROM simd_postcodes;\n")
    print(f"Created: {index_file}")

    print(f"\nDone! Created {chunk_num} SQL files in {output_dir}")
    print("\nTo import:")
    print("1. Go to Supabase Dashboard > SQL Editor")
    print("2. Run 00_delete_existing.sql first")
    print("3. Run each numbered file in order (01, 02, 03, etc.)")
    print(f"4. Run {chunk_num:02d}_indexes.sql last")

if __name__ == "__main__":
    main()
