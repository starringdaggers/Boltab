-- Boltab Brilliant Schools — migration for "Release Results" feature:
--   • Admins can release/withhold an entire term's results from students
--   • Admins can additionally withhold one specific student's report card
--     even when the term is otherwise released
--
-- Run this once in Neon's SQL Editor (same as the previous migration files).

ALTER TABLE "terms" ADD COLUMN "resultsReleased" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "report_cards" ADD COLUMN "isWithheld" BOOLEAN NOT NULL DEFAULT false;

-- updatedById used to be required (only teachers wrote to this table).
-- Admins can now also create/update a report_cards row (just to set
-- isWithheld) without being a teacher, so this needs to be optional.
ALTER TABLE "report_cards" ALTER COLUMN "updatedById" DROP NOT NULL;
