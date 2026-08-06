-- Run this once in Neon's SQL Editor.
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "reportCardsGloballyWithheld" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- Seed the single row it will ever have
INSERT INTO "school_settings" ("id", "reportCardsGloballyWithheld")
VALUES ('singleton', false)
ON CONFLICT ("id") DO NOTHING;
