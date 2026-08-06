import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";

export async function GET() {
  const session = await requireAdminAccess("reportCards");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const settings = await db.schoolSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json({ reportCardsGloballyWithheld: settings.reportCardsGloballyWithheld });
}

const toggleSchema = z.object({ withheld: z.boolean() });

export async function PATCH(req: NextRequest) {
  const session = await requireAdminAccess("reportCards");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = toggleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const settings = await db.schoolSettings.upsert({
    where: { id: "singleton" },
    update: { reportCardsGloballyWithheld: parsed.data.withheld },
    create: { id: "singleton", reportCardsGloballyWithheld: parsed.data.withheld },
  });

  return NextResponse.json({ reportCardsGloballyWithheld: settings.reportCardsGloballyWithheld });
}
