import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { ClassEvent } from "@prisma/client";

export function ClassesSection({ classes }: { classes: ClassEvent[] }) {
  return (
    <section id="classes" className="py-32 px-6 bg-[var(--color-ink)]/40">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Classes & Gatherings"
          title="Sit with us"
          description="Weekly ongoing classes and seasonal workshops in the Himalayan tradition."
        />

        {classes.length === 0 ? (
          <p className="text-center text-[var(--color-mist)]">
            New classes coming soon.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {classes.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-[var(--color-veil)] bg-[var(--color-night-2)]/60 p-6 hover:border-[var(--color-gold)]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-serif text-xl text-[var(--color-pearl)] leading-snug">
                    {c.title}
                  </h3>
                  {c.isWorkshop && c.priceCents != null && (
                    <span className="shrink-0 text-xs uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-3 py-1 rounded">
                      {formatPrice(c.priceCents)}
                    </span>
                  )}
                  {!c.isWorkshop && (
                    <span className="shrink-0 text-xs uppercase tracking-widest text-[var(--color-mist)]">
                      Members
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-moon)] mb-4 line-clamp-2">
                  {c.description}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-mist)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateTime(c.startsAt)}
                  </span>
                  {c.recurring && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Weekly
                    </span>
                  )}
                  {c.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {c.location}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/classes"
            className="inline-block text-sm uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] border-b border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] pb-1 transition-colors"
          >
            Full Calendar →
          </Link>
        </div>
      </div>
    </section>
  );
}
