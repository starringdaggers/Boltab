import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminAccess("students");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const student = await db.student.findUnique({ where: { id: params.id } });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await db.user.update({
    where: { id: student.userId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ tempPassword });
}
