-- Boltab Brilliant Schools — migration for:
--   1. Login rate limiting (3 failed attempts locks an account for 10 minutes)
--   2. Report card "5. Weight & Height" section
--
-- Run this once in Neon's SQL Editor (same as the previous migration files).

ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP(3);

ALTER TABLE "report_cards" ADD COLUMN "weightKg" DOUBLE PRECISION;
ALTER TABLE "report_cards" ADD COLUMN "heightCm" DOUBLE PRECISION;
