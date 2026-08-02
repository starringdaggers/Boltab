import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/hash";
import { generateTempPassword } from "@/lib/password";

/**
 * Expects a CSV with header row: name,email,admissionNo,className
 * className must match an existing class's name exactly (case-insensitive).
 * This is a minimal parser — it does not support commas inside quoted fields,
 * which is fine for typical name/email/admission-number data.
 */
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.csv || typeof body.csv !== "string") {
    return NextResponse.json({ error: "No CSV content provided." }, { status: 400 });
  }

  const rows = parseCsv(body.csv);
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV needs a header row plus at least one student row." }, { status: 400 });
  }

  const header = rows[0].map((h) => h.toLowerCase());
  const requiredCols = ["name", "email", "admissionno", "classname"];
  const colIndex = (col: string) => header.indexOf(col);

  if (requiredCols.some((c) => colIndex(c) === -1)) {
    return NextResponse.json(
      { error: "CSV header must include: name, email, admissionNo, className" },
      { status: 400 }
    );
  }

  const classes: { id: string; name: string }[] = await db.class.findMany();
  const classByName = new Map<string, { id: string; name: string }>(
    classes.map((c) => [c.name.toLowerCase(), { id: c.id, name: c.name }])
  );

  const created: { name: string; email: string; tempPassword: string }[] = [];
  const errors: { row: number; reason: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[colIndex("name")];
    const email = row[colIndex("email")]?.toLowerCase();
    const admissionNo = row[colIndex("admissionno")];
    const className = row[colIndex("classname")];

    if (!name || !email || !admissionNo || !className) {
      errors.push({ row: i + 1, reason: "Missing a required field." });
      continue;
    }

    const matchedClass = classByName.get(className.toLowerCase());
    if (!matchedClass) {
      errors.push({ row: i + 1, reason: `Class "${className}" doesn't exist.` });
      continue;
    }

    const emailTaken = await db.user.findUnique({ where: { email } });
    if (emailTaken) {
      errors.push({ row: i + 1, reason: `Email "${email}" already in use.` });
      continue;
    }
    const admissionTaken = await db.student.findUnique({ where: { admissionNo } });
    if (admissionTaken) {
      errors.push({ row: i + 1, reason: `Admission number "${admissionNo}" already in use.` });
      continue;
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    try {
      await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
          student: { create: { admissionNo, classId: matchedClass.id } },
        },
      });
      created.push({ name, email, tempPassword });
    } catch {
      errors.push({ row: i + 1, reason: "Couldn't create this account." });
    }
  }

  return NextResponse.json({ created, errors });
}
