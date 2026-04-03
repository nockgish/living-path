import { notFound } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await prisma.essay.findUnique({ where: { slug } });
  return {
    title: essay?.title ?? "Essay",
    description: essay?.excerpt,
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await prisma.essay.findUnique({ where: { slug } });
  if (!essay || !essay.publishedAt) notFound();

  const safeHtml = sanitizeHtml(essay.contentHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "i", "b",
      "blockquote", "ul", "ol", "li", "a", "img", "code", "pre", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/essays"
          className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
        >
          ← All essays
        </Link>

        <header className="my-12 text-center">
          {essay.publishedAt && (
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-4">
              {formatDate(essay.publishedAt)}
              {essay.source === "substack" && " · Substack"}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[var(--color-pearl)] font-light leading-tight">
            {essay.title}
          </h1>
        </header>

        {essay.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={essay.coverImage}
            alt=""
            className="w-full rounded-lg border border-[var(--color-veil)] mb-12"
          />
        )}

        <div
          className="prose-living"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        {essay.source === "substack" && essay.substackUrl && (
          <p className="text-center mt-12 text-xs text-[var(--color-mist)]">
            Originally published on{" "}
            <a
              href={essay.substackUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
            >
              Substack →
            </a>
          </p>
        )}
      </div>
    </article>
  );
}
