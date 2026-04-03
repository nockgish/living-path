import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendContactMessage } from "@/lib/resend";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
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
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const { name, email, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: { name, email, message },
    });
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    const to = settings?.contactEmail;
    if (to) {
      await sendContactMessage({
        to,
        fromName: name,
        fromEmail: email,
        message,
      }).catch((e) => console.error("[contact] email failed", e));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact]", e);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
