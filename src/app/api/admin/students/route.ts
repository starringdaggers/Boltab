import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";

export async function GET(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId") || undefined;

  const students = await db.student.findMany({
    where: classId ? { classId } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      class: true,
    },
    orderBy: { user: { name: "asc" } },
  });
  return NextResponse.json({ students });
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  admissionNo: z.string().min(1).max(50),
  classId: z.string().min(1),
  guardianName: z.string().max(100).optional(),
  guardianPhone: z.string().max(30).optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in all required student fields correctly." }, { status: 400 });
  }

  const emailTaken = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (emailTaken) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const admissionTaken = await db.student.findUnique({
    where: { admissionNo: parsed.data.admissionNo },
  });
  if (admissionTaken) {
    return NextResponse.json({ error: "This admission number is already in use." }, { status: 409 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await db.user
    .create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "STUDENT",
        student: {
          create: {
            admissionNo: parsed.data.admissionNo,
            classId: parsed.data.classId,
            guardianName: parsed.data.guardianName,
            guardianPhone: parsed.data.guardianPhone,
          },
        },
      },
      include: { student: { include: { class: true } } },
    })
    .catch(() => null);

  if (!user) {
    return NextResponse.json({ error: "Couldn't create student — check the class exists." }, { status: 400 });
  }

  return NextResponse.json(
    {
      student: user.student,
      user: { id: user.id, name: user.name, email: user.email },
      tempPassword,
    },
    { status: 201 }
  );
}
