import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teachers = await db.teacher.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      assignments: { include: { class: true, subject: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
  return NextResponse.json({ teachers });
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name and email." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "TEACHER",
      teacher: { create: {} },
    },
    include: { teacher: true },
  });

  return NextResponse.json(
    {
      teacher: user.teacher,
      user: { id: user.id, name: user.name, email: user.email },
      tempPassword, // shown once — admin must share this with the teacher directly
    },
    { status: 201 }
  );
}
