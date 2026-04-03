"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";

const SettingsInput = z.object({
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  heroTagline: z.string().min(1),
  lineageBody: z.string().min(1),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  substackUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const parsed = SettingsInput.parse({
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroSubtitle: String(formData.get("heroSubtitle") ?? ""),
    heroTagline: String(formData.get("heroTagline") ?? ""),
    lineageBody: String(formData.get("lineageBody") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    substackUrl: String(formData.get("substackUrl") ?? ""),
    youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...parsed,
      instagramUrl: parsed.instagramUrl || null,
      substackUrl: parsed.substackUrl || null,
      youtubeUrl: parsed.youtubeUrl || null,
      contactEmail: parsed.contactEmail || null,
    },
    create: {
      id: "singleton",
      ...parsed,
      instagramUrl: parsed.instagramUrl || null,
      substackUrl: parsed.substackUrl || null,
      youtubeUrl: parsed.youtubeUrl || null,
      contactEmail: parsed.contactEmail || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
