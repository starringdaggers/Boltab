import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teacher = await db.teacher.findUnique({ where: { id: params.id } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await db.user.update({
    where: { id: teacher.userId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ tempPassword });
}
