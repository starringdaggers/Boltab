const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** Generates a readable random temp password, e.g. "kP7mQ2xR" */
export function generateTempPassword(length = 10): string {
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return pw;
}
