-- Run this once in Neon's SQL Editor.
CREATE TABLE "admin_delegations" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "canManageClasses" BOOLEAN NOT NULL DEFAULT false,
    "canManageSubjects" BOOLEAN NOT NULL DEFAULT false,
    "canManageTerms" BOOLEAN NOT NULL DEFAULT false,
    "canManageStudents" BOOLEAN NOT NULL DEFAULT false,
    "canManageReportCards" BOOLEAN NOT NULL DEFAULT false,
    "canManageAttendance" BOOLEAN NOT NULL DEFAULT false,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_delegations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_delegations_teacherId_key" ON "admin_delegations"("teacherId");

ALTER TABLE "admin_delegations" ADD CONSTRAINT "admin_delegations_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_delegations" ADD CONSTRAINT "admin_delegations_grantedById_fkey"
    FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
