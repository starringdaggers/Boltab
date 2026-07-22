-- Boltab Brilliant Schools — migration for:
--   1. Password change (no schema change needed, reuses users.passwordHash)
--   2. 70%+ aggregate celebration popup (no schema change needed)
--   3. Full continuous-assessment report card (1st Half / 2nd Half / Exam
--      breakdown + attendance/psychomotor/affective/comments)
--
-- Run this once in Neon's SQL Editor if you set your database up with
-- manual_init.sql instead of `prisma migrate dev`. If you've been using
-- `prisma migrate dev` all along, just run that instead and skip this file.

-- 1. Extend "results" with the 1st Half / 2nd Half / Examination breakdown
ALTER TABLE "results" RENAME COLUMN "testScore" TO "firstHalfScore";
ALTER TABLE "results" ADD COLUMN "firstHalfObtainable" DOUBLE PRECISION NOT NULL DEFAULT 20;
ALTER TABLE "results" ADD COLUMN "secondHalfScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "results" ADD COLUMN "secondHalfObtainable" DOUBLE PRECISION NOT NULL DEFAULT 20;
ALTER TABLE "results" ADD COLUMN "examObtainable" DOUBLE PRECISION NOT NULL DEFAULT 60;
ALTER TABLE "results" ADD COLUMN "totalObtainable" DOUBLE PRECISION NOT NULL DEFAULT 100;
ALTER TABLE "results" ALTER COLUMN "firstHalfScore" SET DEFAULT 0;
ALTER TABLE "results" ALTER COLUMN "examScore" SET DEFAULT 0;

-- 2. New table for the non-subject parts of the report card
CREATE TABLE "report_cards" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "timesSchoolOpened" INTEGER,
    "timesPresent" INTEGER,
    "timesAbsent" INTEGER,
    "nextTermBegins" TEXT,
    "psychomotor" JSONB,
    "affective" JSONB,
    "generalPerformance" TEXT,
    "classTeacherName" TEXT,
    "classTeacherComment" TEXT,
    "headmasterComment" TEXT,
    "dateIssued" TEXT,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "report_cards_studentId_termId_key" ON "report_cards"("studentId", "termId");

ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_updatedById_fkey"
    FOREIGN KEY ("updatedById") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Note: any existing rows in "results" keep their old testScore value as
-- firstHalfScore, with secondHalfScore defaulted to 0 — re-enter 2nd Half
-- and Exam marks for those to show correctly on the new report card.
