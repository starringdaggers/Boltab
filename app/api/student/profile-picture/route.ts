import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { validateAndNormalizeImage } from "@/lib/fileValidation";

export async function GET() {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const [user, pendingRequest] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { profilePictureUrl: true },
    }),
    db.profilePictureRequest.findFirst({
      where: { userId: session.userId, status: "PENDING" },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    currentPictureUrl: user?.profilePictureUrl ?? null,
    pendingRequest: pendingRequest
      ? { id: pendingRequest.id, submittedAt: pendingRequest.submittedAt }
      : null,
  });
}

const submitSchema = z.object({ imageDataUrl: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const validated = validateAndNormalizeImage(parsed.data.imageDataUrl);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Only one pending request at a time — replace it rather than piling up
  // duplicates if a student changes their mind before admin reviews it.
  const existing = await db.profilePictureRequest.findFirst({
    where: { userId: session.userId, status: "PENDING" },
  });
  if (existing) {
    await db.profilePictureRequest.update({
      where: { id: existing.id },
      data: { imageDataUrl: validated.normalizedDataUrl, submittedAt: new Date() },
    });
  } else {
    await db.profilePictureRequest.create({
      data: { userId: session.userId, imageDataUrl: validated.normalizedDataUrl },
    });
  }

  return NextResponse.json({ ok: true });
}
