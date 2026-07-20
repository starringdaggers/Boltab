import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE_NAME } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is wrong —
  // don't leak which one it was.
  if (!user) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const token = signSession({
    userId: user.id,
    role: user.role,
    name: user.name,
  });

  const redirectPath =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "TEACHER"
      ? "/teacher"
      : "/student";

  const response = NextResponse.json({ redirectPath });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
