import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Delegation management is always admin-only — never delegable itself,
// so a delegate can never grant themselves (or anyone else) more access.

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teachers = await db.teacher.findMany({
    include: {
      user: { select: { name: true, email: true } },
      delegation: true,
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json({ teachers });
}

const permissionsSchema = z.object({
  canManageClasses: z.boolean(),
  canManageSubjects: z.boolean(),
  canManageTerms: z.boolean(),
  canManageStudents: z.boolean(),
  canManageReportCards: z.boolean(),
  canManageAttendance: z.boolean(),
});

const setSchema = z.object({
  teacherId: z.string().min(1),
  permissions: permissionsSchema,
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = setSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { teacherId, permissions } = parsed.data;

  const anyGranted = Object.values(permissions).some(Boolean);
  if (!anyGranted) {
    // Nothing granted — just remove any existing delegation entirely
    await db.adminDelegation.deleteMany({ where: { teacherId } });
    return NextResponse.json({ ok: true });
  }

  const delegation = await db.adminDelegation
    .upsert({
      where: { teacherId },
      update: permissions,
      create: { teacherId, grantedById: session.userId, ...permissions },
    })
    .catch(() => null);

  if (!delegation) {
    return NextResponse.json({ error: "Couldn't save this delegation." }, { status: 400 });
  }
  return NextResponse.json({ delegation });
}
