import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const TEACHINGS = [
  {
    slug: "spiritual-poetry",
    title: "Spiritual Poetry",
    description:
      "Verse as a doorway to silence — Mirabai, Rumi, Lalla, and the wordless tongue of the heart.",
  },
  {
    slug: "breath-as-teacher",
    title: "Breath as Teacher",
    description:
      "Pranayama and the science of attention — the most honest teacher you will ever meet.",
  },
  {
    slug: "nondual-inquiry",
    title: "Nondual Inquiry",
    description:
      "The direct path of self-investigation. Who is the one who is seeking?",
  },
];

export function TeachingsSection() {
  return (
    <section id="teachings" className="py-32 px-6 max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="The Three Streams"
        title="Teachings"
        description="Three rivers braided into one practice."
      />
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {TEACHINGS.map((t) => (
          <Link
            key={t.slug}
            href={`/teachings/${t.slug}`}
            className="group relative block rounded-lg border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 backdrop-blur-sm p-8 lg:p-10 transition-all duration-300 hover:border-[var(--color-gold)]/60 hover:bg-[var(--color-night-2)]/80 hover:-translate-y-1"
          >
            <ArrowUpRight className="absolute top-6 right-6 h-5 w-5 text-[var(--color-mist)] group-hover:text-[var(--color-gold)] transition-colors" />
            <h3 className="font-serif text-3xl text-[var(--color-pearl)] mb-4 leading-tight">
              {t.title}
            </h3>
            <p className="text-[var(--color-moon)] leading-relaxed">
              {t.description}
            </p>
            <span className="inline-block mt-6 text-xs uppercase tracking-widest text-[var(--color-gold-soft)] group-hover:text-[var(--color-gold)]">
              Enter →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
