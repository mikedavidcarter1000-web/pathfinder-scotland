-- Delete 19 student_benefits rows that duplicate active bursaries entries.
-- 16 originally-flagged duplicates + 3 entitlements migrated to bursaries in 20260423000011
-- (Free NHS Dental Check-ups, Free Period Products, Young Scot National Entitlement Card).
--
-- Cascade impact (verified):
--   benefit_clicks: 2 rows will be removed (1 each on Free bus travel + Young Students' Bursary).
--                   This is the entire benefit_clicks history; loss is acceptable as both
--                   clicks targeted duplicates of bursary entries.
--   benefit_reminders: 0 rows affected (table is empty).
--
-- Post-delete category distribution (verified pre-apply):
--   government: 10 -> 0 (entire category emptied; UI handling flagged for Task 4 audit)
--   funding:    10 -> 1 (Student Loan SAAS retained per user direction)
--
-- Student Loan (SAAS) is intentionally retained -- repayable loan does not belong
-- in bursaries. Funding-category rework deferred to Phase 2 (student_benefits vs offers
-- consolidation -- see docs/phase-2-backlog.md).
--
-- Transaction boundary owned by applying tool (no BEGIN/COMMIT here).

DELETE FROM public.student_benefits
WHERE id IN (
  'a9680ab7-393e-4cc7-b66e-383ba365cb83',  -- Best Start Grant -- School Age Payment
  'e68632a7-e425-4d07-9f3a-b66b83416528',  -- Care-Experienced Students' Bursary
  'a1003282-4917-48f1-96a9-380c1c6a61aa',  -- Council tax exemption
  '44c9b2ec-dbf5-4ba0-9bc1-9ec677b1e7de',  -- Disabled Students' Allowance
  'b1af4f5f-1b12-476f-953c-cbbab1a28d8e',  -- Discretionary Funds (colleges)
  'bc07ecfd-e47f-4ad6-8cdb-7aa93f654c77',  -- Education Maintenance Allowance (EMA)
  '61e18780-6580-4d47-9fe3-e46eb0d265f5',  -- Free bus travel for under-22s
  '7843f118-6960-47a4-9c52-49cf6c653920',  -- Free NHS dental check-ups (Task 2 migration duplicate)
  'cac61f36-2e97-450b-bbc7-724410f8602a',  -- Free NHS eye tests
  'a473cc99-54c7-4193-8acb-63522eb5cfbf',  -- Free NHS prescriptions
  'fe1f9bee-2b5d-401f-b2ee-3af78cb8c08d',  -- Free period products (Task 2 migration duplicate)
  '7bbb36f4-9720-432c-a083-1695f7b43c36',  -- Free school meals
  '20bcdff2-e000-4290-bde0-c71d89fe2efa',  -- Free tuition fees (SAAS)
  '4a17ac22-8eda-45e8-87e6-fd54d983ba68',  -- Independent Students' Bursary
  '4c3f2b81-700c-4703-b21a-199b7fde5c9f',  -- Lone Parent Grant
  '5b619a64-7514-49c5-af70-8f551d23808d',  -- School Clothing Grant
  'ba50b48a-af53-4100-8797-45390945608b',  -- University hardship funds
  '7b55b102-0bdf-4e98-8c16-8df7f6534cc6',  -- Young Scot National Entitlement Card (Task 2 migration duplicate)
  'fed79f75-0a18-4102-baf4-9a7b693969d9'   -- Young Students' Bursary
);
