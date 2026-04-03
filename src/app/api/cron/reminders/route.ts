import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { expandEvents } from "@/lib/classes";
import { sendClassReminder } from "@/lib/resend";

async function authorized(req: Request) {
  const url = new URL(req.url);
  const tokenQ = url.searchParams.get("token");
  const tokenH = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && (tokenQ === cronSecret || tokenH === cronSecret)) return true;
  const session = await auth();
  return session?.user?.role === Role.ADMIN;
}

// Reminder window: notify RSVPs whose class starts in the next 24-25h
const WINDOW_HOURS_MIN = 23;
const WINDOW_HOURS_MAX = 25;

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const now = new Date();
    const winStart = new Date(now.getTime() + WINDOW_HOURS_MIN * 3600 * 1000);
    const winEnd = new Date(now.getTime() + WINDOW_HOURS_MAX * 3600 * 1000);

    const events = await prisma.classEvent.findMany({
      where: { published: true },
    });
    const expanded = expandEvents(events, winStart, winEnd);

    let sent = 0;
    let skipped = 0;

    for (const occ of expanded) {
      // Find RSVPs for this occurrence (or for the base event if non-recurring)
      const rsvps = await prisma.rSVP.findMany({
        where: {
          classEventId: occ.classEventId,
          reminderSent: false,
          OR: occ.isRecurringInstance
            ? [{ occurrence: occ.startsAt }]
            : [{ occurrence: null }, { occurrence: occ.startsAt }],
        },
        include: { user: true },
      });

      for (const r of rsvps) {
        if (!r.user.email) {
          skipped++;
          continue;
        }
        try {
          await sendClassReminder({
            to: r.user.email,
            classTitle: occ.title,
            startsAt: occ.startsAt,
            zoomUrl: occ.zoomUrl,
          });
          await prisma.rSVP.update({
            where: { id: r.id },
            data: { reminderSent: true },
          });
          sent++;
        } catch (err) {
          console.error("[reminders] send failed", r.id, err);
          skipped++;
        }
      }
    }

    return NextResponse.json({ ok: true, sent, skipped, occurrences: expanded.length });
  } catch (e) {
    console.error("[cron/reminders]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
