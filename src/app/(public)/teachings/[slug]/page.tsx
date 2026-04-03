import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { validateBlocks } from "@/lib/blocks";

export const revalidate = 60;

const VALID_SLUGS = ["spiritual-poetry", "breath-as-teacher", "nondual-inquiry"];

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug: `teachings/${slug}` },
  });
  return { title: page?.title ?? "Teaching" };
}

export default async function TeachingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug)) notFound();

  const page = await prisma.page.findUnique({
    where: { slug: `teachings/${slug}` },
  });
  if (!page || page.status !== "published") notFound();

  const blocks = validateBlocks(page.blocks);

  return (
    <article className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          href="/#teachings"
          className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
        >
          ← All teachings
        </Link>
      </div>
      <div className="mt-8">
        <BlockRenderer blocks={blocks} />
      </div>
    </article>
  );
}
