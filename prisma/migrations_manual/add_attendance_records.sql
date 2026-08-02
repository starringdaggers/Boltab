-- Run this once in Neon's SQL Editor.
-- Creates the table for daily attendance tracking.

CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "markedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "attendance_records_studentId_date_key" ON "attendance_records"("studentId", "date");

ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_markedById_fkey"
    FOREIGN KEY ("markedById") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
