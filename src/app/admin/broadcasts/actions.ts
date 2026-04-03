"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { sendBroadcast } from "@/lib/resend";

const BroadcastInput = z.object({
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  bodyText: z.string().default(""),
});

function parseForm(formData: FormData) {
  return BroadcastInput.parse({
    subject: String(formData.get("subject") ?? ""),
    bodyHtml: String(formData.get("bodyHtml") ?? ""),
    bodyText: String(formData.get("bodyText") ?? ""),
  });
}

export async function createBroadcast(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  const broadcast = await prisma.broadcast.create({
    data: { ...data, status: "draft" },
  });
  revalidatePath("/admin/broadcasts");
  redirect(`/admin/broadcasts/${broadcast.id}`);
}

export async function updateBroadcast(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  const current = await prisma.broadcast.findUnique({ where: { id } });
  if (!current) throw new Error("Broadcast not found");
  if (current.status === "sent") throw new Error("Cannot edit a sent broadcast");
  await prisma.broadcast.update({ where: { id }, data });
  revalidatePath("/admin/broadcasts");
  revalidatePath(`/admin/broadcasts/${id}`);
}

export async function sendBroadcastAction(id: string) {
  await requireAdmin();
  const broadcast = await prisma.broadcast.findUnique({ where: { id } });
  if (!broadcast) throw new Error("Broadcast not found");
  if (broadcast.status === "sent") throw new Error("Already sent");

  const subscribers = await prisma.subscriber.findMany({
    where: { status: "active" },
  });
  const result = await sendBroadcast({
    to: subscribers.map((s) => s.email),
    subject: broadcast.subject,
    bodyHtml: broadcast.bodyHtml,
  });

  await prisma.broadcast.update({
    where: { id },
    data: {
      status: "sent",
      sentAt: new Date(),
      sentCount: result.sent,
    },
  });
  revalidatePath("/admin/broadcasts");
  revalidatePath(`/admin/broadcasts/${id}`);
}

export async function deleteBroadcast(id: string) {
  await requireAdmin();
  await prisma.broadcast.delete({ where: { id } });
  revalidatePath("/admin/broadcasts");
  redirect("/admin/broadcasts");
}
