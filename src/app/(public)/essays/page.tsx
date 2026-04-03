import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Essays" };
export const revalidate = 60;

export default async function EssaysIndex() {
  const essays = await prisma.essay.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-4">
          Writing
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-pearl)] font-light">
          Essays
        </h1>
      </header>

      {essays.length === 0 ? (
        <p className="text-center text-[var(--color-mist)]">
          New essays will appear here.
        </p>
      ) : (
        <div className="space-y-12">
          {essays.map((e) => (
            <Link
              key={e.id}
              href={
                e.source === "substack" && e.substackUrl
                  ? e.substackUrl
                  : `/essays/${e.slug}`
              }
              target={e.source === "substack" ? "_blank" : undefined}
              className="group block border-b border-[var(--color-veil)]/40 pb-12 last:border-0"
            >
              {e.publishedAt && (
                <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-3">
                  {formatDate(e.publishedAt)}
                  {e.source === "substack" && " · Substack"}
                </p>
              )}
              <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-pearl)] group-hover:text-[var(--color-gold-soft)] transition-colors mb-3">
                {e.title}
              </h2>
              <p className="text-[var(--color-moon)] leading-relaxed">{e.excerpt}</p>
              <span className="inline-block mt-4 text-xs uppercase tracking-widest text-[var(--color-gold-soft)] group-hover:text-[var(--color-gold)]">
                Read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
