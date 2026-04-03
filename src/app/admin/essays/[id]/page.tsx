import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EssayForm } from "@/components/admin/EssayForm";
import { updateEssay, deleteEssay } from "../actions";

export const metadata = { title: "Admin · Edit Essay" };

export default async function EditEssayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const essay = await prisma.essay.findUnique({ where: { id } });
  if (!essay) notFound();

  const isSubstack = essay.source === "substack";

  const update = updateEssay.bind(null, essay.id);
  const remove = deleteEssay.bind(null, essay.id);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Edit Essay
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            {essay.title}
          </h1>
          {isSubstack && essay.substackUrl && (
            <p className="text-xs text-[var(--color-mist)] mt-2">
              Imported from{" "}
              <a
                href={essay.substackUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
              >
                Substack
              </a>
            </p>
          )}
        </div>
        {essay.publishedAt && (
          <Link
            href={`/essays/${essay.slug}`}
            target="_blank"
            className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
          >
            View public →
          </Link>
        )}
      </header>

      <EssayForm
        defaults={{
          title: essay.title,
          slug: essay.slug,
          excerpt: essay.excerpt,
          contentHtml: essay.contentHtml,
          coverImage: essay.coverImage,
          publishedAt: essay.publishedAt,
        }}
        action={update}
        onDelete={remove}
        submitLabel="Save changes"
      />
    </div>
  );
}
