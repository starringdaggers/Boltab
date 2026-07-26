-- Run this once in Neon's SQL Editor (console.neon.tech → your project → SQL Editor)
-- Adds Weight (kg) and Height (cm) fields to the report card.

ALTER TABLE "report_cards"
  ADD COLUMN IF NOT EXISTS "weightKg" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "heightCm" DOUBLE PRECISION;
