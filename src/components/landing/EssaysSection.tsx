import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { formatDate } from "@/lib/utils";
import type { Essay } from "@prisma/client";

export function EssaysSection({ essays }: { essays: Essay[] }) {
  return (
    <section id="essays" className="py-32 px-6 max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Writing"
        title="Essays"
        description="Notes from the practice — short reflections, longer meditations, and the occasional poem."
      />

      {essays.length === 0 ? (
        <p className="text-center text-[var(--color-mist)]">
          New essays will appear here as they are written.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {essays.map((essay) => (
            <Link
              key={essay.id}
              href={
                essay.source === "substack" && essay.substackUrl
                  ? essay.substackUrl
                  : `/essays/${essay.slug}`
              }
              target={essay.source === "substack" ? "_blank" : undefined}
              className="group block"
            >
              <article>
                {essay.publishedAt && (
                  <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-3">
                    {formatDate(essay.publishedAt)}
                  </p>
                )}
                <h3 className="font-serif text-2xl text-[var(--color-pearl)] mb-3 leading-tight group-hover:text-[var(--color-gold-soft)] transition-colors">
                  {essay.title}
                </h3>
                <p className="text-sm text-[var(--color-moon)] leading-relaxed line-clamp-3">
                  {essay.excerpt}
                </p>
                <span className="inline-block mt-4 text-xs uppercase tracking-widest text-[var(--color-gold-soft)] group-hover:text-[var(--color-gold)]">
                  Read →
                </span>
              </article>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-16">
        <Link
          href="/essays"
          className="inline-block text-sm uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] border-b border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] pb-1 transition-colors"
        >
          Read All Essays →
        </Link>
      </div>
    </section>
  );
}
