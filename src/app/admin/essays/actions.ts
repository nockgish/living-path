"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const EssayInput = z.object({
  title: z.string().min(1, "Title required"),
  slug: z.string().optional(),
  excerpt: z.string().default(""),
  contentHtml: z.string().default(""),
  coverImage: z.string().optional().nullable(),
  publish: z.boolean().default(false),
});

function parseForm(formData: FormData) {
  return EssayInput.parse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    excerpt: String(formData.get("excerpt") ?? ""),
    contentHtml: String(formData.get("contentHtml") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "") || null,
    publish: formData.get("publish") === "on" || formData.get("publish") === "true",
  });
}

export async function createEssay(formData: FormData) {
  const admin = await requireAdmin();
  const data = parseForm(formData);
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);

  const existing = await prisma.essay.findUnique({ where: { slug } });
  if (existing) throw new Error(`Slug "${slug}" already used`);

  const essay = await prisma.essay.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage,
      authorId: admin.id,
      source: "native",
      publishedAt: data.publish ? new Date() : null,
    },
  });
  revalidatePath("/admin/essays");
  revalidatePath("/essays");
  redirect(`/admin/essays/${essay.id}`);
}

export async function updateEssay(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  const slug = data.slug ? slugify(data.slug) : undefined;

  const current = await prisma.essay.findUnique({ where: { id } });
  if (!current) throw new Error("Essay not found");

  await prisma.essay.update({
    where: { id },
    data: {
      title: data.title,
      slug: slug ?? current.slug,
      excerpt: data.excerpt,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage,
      publishedAt: data.publish
        ? current.publishedAt ?? new Date()
        : null,
    },
  });
  revalidatePath("/admin/essays");
  revalidatePath("/essays");
  revalidatePath(`/essays/${slug ?? current.slug}`);
}

export async function deleteEssay(id: string) {
  await requireAdmin();
  await prisma.essay.delete({ where: { id } });
  revalidatePath("/admin/essays");
  revalidatePath("/essays");
  redirect("/admin/essays");
}
