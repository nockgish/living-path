import { SectionHeading } from "./SectionHeading";

export function LineageSection({ body }: { body: string }) {
  return (
    <section id="lineage" className="py-32 px-6 bg-[var(--color-ink)]/40">
      <div className="max-w-3xl mx-auto">
        <SectionHeading eyebrow="Our Roots" title="Lineage" />
        <div className="prose-living text-center md:text-left">
          {body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
