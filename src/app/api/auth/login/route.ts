import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 10;

function minutesRemaining(lockedUntil: Date): number {
  return Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000));
}

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

  // Account is currently locked out from too many recent failed attempts
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const mins = minutesRemaining(user.lockedUntil);
    return NextResponse.json(
      {
        error: `Too many failed sign-in attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    // Atomic increment at the database level — this is the important part.
    // The previous version did a separate read then write, so several
    // concurrent wrong-password requests could all read the same starting
    // count before any of them wrote it back, letting more than 3 real
    // guesses through before the lock engaged. A single atomic UPDATE ...
    // SET count = count + 1 is serialized by Postgres per-row, so
    // concurrent requests each see a genuinely incremented value instead
    // of racing on a stale read.
    const updated = await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });

    if (updated.failedLoginAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      await db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil },
      });
      return NextResponse.json(
        {
          error: `Too many failed sign-in attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  // Successful login — clear any prior failed attempts
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  const token = await signSession({
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
