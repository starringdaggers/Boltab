-- Run this once in Neon's SQL Editor.
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
