-- Run this once in Neon's SQL Editor.
-- Adds itemized line items + release/draft control to class fee bills.

ALTER TABLE "class_fees"
  ADD COLUMN IF NOT EXISTS "lineItems" JSONB,
  ADD COLUMN IF NOT EXISTS "isReleased" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);
