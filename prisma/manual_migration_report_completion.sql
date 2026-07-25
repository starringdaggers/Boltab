-- Boltab Brilliant Schools — migration for report card "Mark as complete"
-- Run this once in Neon's SQL Editor (same as the previous migration files).

ALTER TABLE "report_cards" ADD COLUMN "isComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "report_cards" ADD COLUMN "completedAt" TIMESTAMP(3);
