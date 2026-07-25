-- Boltab Brilliant Schools — migration for School Fees / Payments
-- Run this once in Neon's SQL Editor (same as the previous migration files).

CREATE TABLE "school_accounts" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "school_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "class_fees" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "class_fees_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "class_fees_classId_termId_key" ON "class_fees"("classId", "termId");
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "amountClaimed" DOUBLE PRECISION NOT NULL,
    "receiptDataUrl" TEXT NOT NULL,
    "receiptFileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
