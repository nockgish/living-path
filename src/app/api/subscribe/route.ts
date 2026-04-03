import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";

const Schema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  source: z.string().max(60).optional().nullable(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email." },
      { status: 400 }
    );
  }
  const { email, name, source } = parsed.data;
  const normalized = email.toLowerCase().trim();

  try {
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      if (existing.status !== "active") {
        await prisma.subscriber.update({
          where: { email: normalized },
          data: { status: "active", name: name ?? existing.name },
        });
        return NextResponse.json({
          ok: true,
          message: "Welcome back. You are subscribed.",
        });
      }
      return NextResponse.json({
        ok: true,
        message: "You are already subscribed.",
      });
    }

    const created = await prisma.subscriber.create({
      data: { email: normalized, name: name ?? null, source: source ?? null },
    });

    sendWelcomeEmail({
      to: normalized,
      name: name ?? undefined,
      unsubToken: created.unsubToken,
    }).catch((e) => console.error("[subscribe] welcome email failed", e));

    return NextResponse.json({
      ok: true,
      message: "Subscribed. A welcome note is on its way.",
    });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
