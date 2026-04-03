"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { slugify } from "@/lib/utils";
import { validateBlocks } from "@/lib/blocks";

const PageMeta = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function createPage(formData: FormData) {
  const admin = await requireAdmin();
  const data = PageMeta.parse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
  });
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) throw new Error(`Slug "${slug}" already used`);

  const page = await prisma.page.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      blocks: [],
      status: "draft",
      updatedById: admin.id,
    },
  });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function savePageBlocks(id: string, blocksJson: string) {
  const admin = await requireAdmin();
  const raw = JSON.parse(blocksJson);
  const validated = validateBlocks(raw);
  const page = await prisma.page.update({
    where: { id },
    data: {
      blocks: validated as unknown as object,
      updatedById: admin.id,
    },
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath(`/p/${page.slug}`);
  if (page.slug.startsWith("teachings/")) {
    revalidatePath(`/${page.slug}`);
  }
}

export async function updatePageMeta(id: string, formData: FormData) {
  await requireAdmin();
  const data = PageMeta.parse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
  });
  const current = await prisma.page.findUnique({ where: { id } });
  if (!current) throw new Error("Page not found");
  const slug = data.slug ? slugify(data.slug) : current.slug;
  await prisma.page.update({
    where: { id },
    data: { title: data.title, slug, description: data.description },
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath(`/p/${slug}`);
  revalidatePath(`/p/${current.slug}`);
}

export async function publishPage(id: string, publish: boolean) {
  await requireAdmin();
  const page = await prisma.page.update({
    where: { id },
    data: {
      status: publish ? "published" : "draft",
      publishedAt: publish ? new Date() : null,
    },
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath(`/p/${page.slug}`);
  if (page.slug.startsWith("teachings/")) {
    revalidatePath(`/${page.slug}`);
  }
}

export async function deletePage(id: string) {
  await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (page?.slug.startsWith("teachings/")) {
    throw new Error("Cannot delete a built-in teaching page");
  }
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
