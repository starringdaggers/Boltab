/**
 * Validates an uploaded file's *actual* content, not just what the client
 * claims it is. The `data:image/png;base64,...` prefix in a data URL is
 * entirely client-supplied and trivially forgeable — someone can label any
 * file as an image and a naive `startsWith("data:")` check would accept it.
 *
 * This checks the real magic bytes (the file format's binary signature) and
 * rebuilds the data URL using the *sniffed* MIME type, so what gets stored
 * always matches what the bytes actually are — not what the client said.
 *
 * SVG is intentionally never accepted: it's XML that can carry <script>
 * content, and there's no safe way to "sniff" a safe subset of it here.
 */

type SniffResult = { mimeType: string; extensionHint: string } | null;

function sniff(bytes: Uint8Array): SniffResult {
  const b = bytes;

  // JPEG: FF D8 FF
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mimeType: "image/jpeg", extensionHint: ".jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return { mimeType: "image/png", extensionHint: ".png" };
  }
  // PDF: "%PDF"
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
    return { mimeType: "application/pdf", extensionHint: ".pdf" };
  }
  // WEBP: "RIFF"...."WEBP"
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return { mimeType: "image/webp", extensionHint: ".webp" };
  }
  return null;
}

export function validateAndNormalizeReceipt(
  dataUrl: string
): { ok: true; normalizedDataUrl: string } | { ok: false; error: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return { ok: false, error: "That doesn't look like a valid uploaded file." };
  }
  const base64Payload = match[2];

  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64Payload, "base64");
  } catch {
    return { ok: false, error: "Couldn't read that file." };
  }
  if (bytes.length === 0) {
    return { ok: false, error: "That file appears to be empty." };
  }

  const sniffed = sniff(bytes);
  if (!sniffed) {
    return {
      ok: false,
      error: "Receipt must be a JPEG, PNG, WEBP image, or a PDF. Other file types (including SVG) aren't accepted.",
    };
  }

  // Rebuild the data URL from the sniffed type — never trust the client's
  // declared MIME type in the prefix, even if it happened to be correct.
  const normalizedDataUrl = `data:${sniffed.mimeType};base64,${base64Payload}`;
  return { ok: true, normalizedDataUrl };
}

/**
 * Same magic-byte sniffing as receipts, but for profile pictures — PDFs are
 * rejected here since a profile picture must actually be an image.
 * A max size is enforced too, since photos get shown small everywhere
 * (avatars, report cards) and don't need to be huge.
 */
export function validateAndNormalizeImage(
  dataUrl: string,
  maxBytes = 2_000_000
): { ok: true; normalizedDataUrl: string } | { ok: false; error: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return { ok: false, error: "That doesn't look like a valid uploaded file." };
  }
  const base64Payload = match[2];

  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64Payload, "base64");
  } catch {
    return { ok: false, error: "Couldn't read that file." };
  }
  if (bytes.length === 0) {
    return { ok: false, error: "That file appears to be empty." };
  }
  if (bytes.length > maxBytes) {
    return { ok: false, error: "That image is too large — please use one under 2MB." };
  }

  const sniffed = sniff(bytes);
  if (!sniffed || sniffed.mimeType === "application/pdf") {
    return {
      ok: false,
      error: "Profile pictures must be a JPEG, PNG, or WEBP image.",
    };
  }

  const normalizedDataUrl = `data:${sniffed.mimeType};base64,${base64Payload}`;
  return { ok: true, normalizedDataUrl };
}
