import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendRsvpConfirmation } from "@/lib/resend";

const Body = z.object({
  classEventId: z.string().min(1),
  occurrence: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { classEventId, occurrence } = parsed.data;
  const occDate = occurrence ? new Date(occurrence) : null;

  const event = await prisma.classEvent.findUnique({
    where: { id: classEventId },
  });
  if (!event) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }
  if (event.isWorkshop && event.priceCents != null) {
    return NextResponse.json(
      { error: "Workshops require purchase" },
      { status: 400 }
    );
  }

  // Capacity check
  if (event.capacity != null) {
    const count = await prisma.rSVP.count({
      where: {
        classEventId,
        occurrence: occDate,
      },
    });
    if (count >= event.capacity) {
      return NextResponse.json({ error: "Class is full" }, { status: 409 });
    }
  }

  try {
    await prisma.rSVP.create({
      data: {
        userId: session.user.id,
        classEventId,
        occurrence: occDate,
      },
    });
  } catch {
    return NextResponse.json({ ok: true, message: "Already RSVPd" });
  }

  const startsAt = occDate ?? event.startsAt;
  if (session.user.email) {
    sendRsvpConfirmation({
      to: session.user.email,
      classTitle: event.title,
      startsAt,
      zoomUrl: event.zoomUrl,
    }).catch((e) => console.error("[rsvp] confirm email failed", e));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { classEventId, occurrence } = parsed.data;
  const occDate = occurrence ? new Date(occurrence) : null;

  await prisma.rSVP.deleteMany({
    where: {
      userId: session.user.id,
      classEventId,
      occurrence: occDate,
    },
  });

  return NextResponse.json({ ok: true });
}
