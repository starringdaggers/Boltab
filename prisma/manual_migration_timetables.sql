-- Boltab Brilliant Schools — migration for the Timetable / Roster builder
-- Run this once in Neon's SQL Editor (same as the previous migration files).

CREATE TABLE "timetables" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "rows" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "timetables" ADD CONSTRAINT "timetables_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
