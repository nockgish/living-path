import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { validateBlocks } from "@/lib/blocks";
import { PageBuilder } from "@/components/admin/PageBuilder";
import { PageMetaForm } from "@/components/admin/PageMetaForm";
import { updatePageMeta, deletePage } from "../actions";

export const metadata = { title: "Admin · Edit Page" };

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  const blocks = validateBlocks(page.blocks);
  const updateMeta = updatePageMeta.bind(null, page.id);
  const remove = deletePage.bind(null, page.id);
  const isBuiltIn = page.slug.startsWith("teachings/");
  const publicHref = isBuiltIn ? `/${page.slug}` : `/p/${page.slug}`;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Page Builder
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            {page.title}
          </h1>
          <p className="text-xs text-[var(--color-mist)] mt-1">{publicHref}</p>
        </div>
        <Link
          href={publicHref}
          target="_blank"
          className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
        >
          View public →
        </Link>
      </header>

      <PageBuilder
        pageId={page.id}
        initialBlocks={blocks}
        initialStatus={page.status}
      />

      <details className="border-t border-[var(--color-veil)]/40 pt-6">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-pearl)]">
          Page metadata
        </summary>
        <div className="mt-6 max-w-2xl space-y-6">
          <PageMetaForm
            defaults={{
              title: page.title,
              slug: page.slug,
              description: page.description,
            }}
            action={updateMeta}
            disableSlug={isBuiltIn}
          />
          {!isBuiltIn && (
            <form action={remove} className="pt-4 border-t border-[var(--color-veil)]/40">
              <button
                type="submit"
                className="text-xs uppercase tracking-widest text-red-300 hover:text-red-200"
              >
                Delete page
              </button>
            </form>
          )}
        </div>
      </details>
    </div>
  );
}
