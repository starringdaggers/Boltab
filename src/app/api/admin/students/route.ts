import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";
import { validateAndNormalizeImage } from "@/lib/fileValidation";

export async function GET(req: NextRequest) {
  const session = await requireAdminAccess("students");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId") || undefined;

  const students = await db.student.findMany({
    where: classId ? { classId } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, profilePictureUrl: true } },
      class: true,
    },
    orderBy: { user: { name: "asc" } },
  });
  // Belt-and-braces: re-sort in JS with a locale-aware comparator so
  // alphabetical order (A→Z, including compound/multi-letter names) is
  // correct regardless of the database's collation settings.
  students.sort((a, b) => a.user.name.localeCompare(b.user.name));
  return NextResponse.json({ students });
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  admissionNo: z.string().min(1).max(50),
  classId: z.string().min(1),
  guardianName: z.string().max(100).optional(),
  guardianPhone: z.string().max(30).optional(),
  profilePictureDataUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdminAccess("students");
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

  let profilePictureUrl: string | undefined;
  if (parsed.data.profilePictureDataUrl) {
    const validated = validateAndNormalizeImage(parsed.data.profilePictureDataUrl);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    profilePictureUrl = validated.normalizedDataUrl;
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
        profilePictureUrl,
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
