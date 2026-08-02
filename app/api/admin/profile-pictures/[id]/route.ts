import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  adminNote: z.string().max(300).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const request_ = await db.profilePictureRequest.findUnique({ where: { id: params.id } });
  if (!request_) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  if (request_.status !== "PENDING") {
    return NextResponse.json({ error: "This request has already been reviewed." }, { status: 409 });
  }

  if (parsed.data.decision === "APPROVE") {
    await db.$transaction([
      db.user.update({
        where: { id: request_.userId },
        data: { profilePictureUrl: request_.imageDataUrl },
      }),
      db.profilePictureRequest.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          reviewedById: session.userId,
          reviewedAt: new Date(),
          adminNote: parsed.data.adminNote,
        },
      }),
    ]);
  } else {
    await db.profilePictureRequest.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewedById: session.userId,
        reviewedAt: new Date(),
        adminNote: parsed.data.adminNote,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
