export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center mb-16 max-w-2xl mx-auto">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-pearl)] font-light mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[var(--color-moon)] text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
