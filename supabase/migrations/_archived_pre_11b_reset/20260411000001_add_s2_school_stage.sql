-- ============================================
-- Add 's2' to school_stage enum
-- Migration: 20260411000001
-- Feature: Onboarding lets students self-identify as S2 (going into S3)
-- ============================================
--
-- Adds 's2' as a new value in the school_stage enum so the onboarding flow
-- can offer a card for students currently in S2. This is an additive change
-- with no impact on existing rows.

ALTER TYPE school_stage ADD VALUE IF NOT EXISTS 's2' BEFORE 's3';
