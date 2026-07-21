import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with `undefined`
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "boltab_session";
