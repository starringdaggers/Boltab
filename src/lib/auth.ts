import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
};

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with `undefined`
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "boltab_session";
