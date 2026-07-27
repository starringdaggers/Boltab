import { randomInt } from "crypto";

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/**
 * Generates a readable random temp password, e.g. "kP7mQ2xR".
 * Uses Node's `crypto.randomInt` (cryptographically secure) rather than
 * `Math.random()`, which is a fast, predictable PRNG never intended for
 * anything security-sensitive like credential generation.
 */
export function generateTempPassword(length = 10): string {
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += CHARS[randomInt(0, CHARS.length)];
  }
  return pw;
}
