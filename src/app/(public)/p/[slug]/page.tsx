import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { validateBlocks } from "@/lib/blocks";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  return {
    title: page?.title ?? "Page",
    description: page?.description ?? undefined,
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Reserve teachings/* for the dedicated route
  if (slug.startsWith("teachings/")) notFound();

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || page.status !== "published") notFound();

  const blocks = validateBlocks(page.blocks);

  return (
    <article className="py-16">
      <header className="max-w-3xl mx-auto px-6 mb-12 text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-pearl)] font-light">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-[var(--color-moon)] mt-4 text-lg italic">
            {page.description}
          </p>
        )}
      </header>
      <BlockRenderer blocks={blocks} />
    </article>
  );
}
