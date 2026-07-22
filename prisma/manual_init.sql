-- Boltab Brilliant Schools — initial database setup
-- Run this once in Neon's SQL Editor (paste the whole thing, then Run)

CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subjects_name_key" ON "subjects"("name");

CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "terms_name_academicYear_key" ON "terms"("name", "academicYear");

CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
CREATE UNIQUE INDEX "students_admissionNo_key" ON "students"("admissionNo");

CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");

CREATE TABLE "teacher_assignments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "teacher_assignments_teacherId_classId_subjectId_key" ON "teacher_assignments"("teacherId", "classId", "subjectId");

CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "testScore" DOUBLE PRECISION NOT NULL,
    "examScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "remark" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "results_studentId_subjectId_termId_key" ON "results"("studentId", "subjectId", "termId");

-- Foreign keys

ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "results" ADD CONSTRAINT "results_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "results" ADD CONSTRAINT "results_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "results" ADD CONSTRAINT "results_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "results" ADD CONSTRAINT "results_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "results" ADD CONSTRAINT "results_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
