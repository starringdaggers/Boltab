-- Run this once in Neon's SQL Editor.
-- Adds profile picture support: a live picture column on users, plus a
-- table for student-submitted change requests awaiting admin approval.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;

CREATE TABLE "profile_picture_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageDataUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profile_picture_requests_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "profile_picture_requests" ADD CONSTRAINT "profile_picture_requests_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "profile_picture_requests" ADD CONSTRAINT "profile_picture_requests_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
