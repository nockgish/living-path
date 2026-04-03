"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";

const ClassInput = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  isWorkshop: z.boolean().default(false),
  priceCents: z.number().int().nonnegative().nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  location: z.string().optional().nullable(),
  zoomUrl: z.string().url().optional().or(z.literal("")).nullable(),
  recurring: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  published: z.boolean().default(true),
});

function parseForm(formData: FormData) {
  const priceStr = String(formData.get("priceCents") ?? "");
  const capStr = String(formData.get("capacity") ?? "");
  return ClassInput.parse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    isWorkshop: formData.get("isWorkshop") === "on",
    priceCents: priceStr ? Math.round(Number(priceStr) * 100) : null,
    capacity: capStr ? Number(capStr) : null,
    location: (String(formData.get("location") ?? "") || null),
    zoomUrl: (String(formData.get("zoomUrl") ?? "") || null),
    recurring: (String(formData.get("recurring") ?? "") || null),
    imageUrl: (String(formData.get("imageUrl") ?? "") || null),
    published: formData.get("published") === "on",
  });
}

export async function createClass(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  const event = await prisma.classEvent.create({
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      zoomUrl: data.zoomUrl || null,
      imageUrl: data.imageUrl || null,
    },
  });
  revalidatePath("/admin/classes");
  revalidatePath("/classes");
  revalidatePath("/");
  redirect(`/admin/classes/${event.id}`);
}

export async function updateClass(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  await prisma.classEvent.update({
    where: { id },
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      zoomUrl: data.zoomUrl || null,
      imageUrl: data.imageUrl || null,
    },
  });
  revalidatePath("/admin/classes");
  revalidatePath("/classes");
  revalidatePath("/");
}

export async function deleteClass(id: string) {
  await requireAdmin();
  await prisma.classEvent.delete({ where: { id } });
  revalidatePath("/admin/classes");
  revalidatePath("/classes");
  revalidatePath("/");
  redirect("/admin/classes");
}
