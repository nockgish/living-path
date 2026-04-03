import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero({
  title,
  subtitle,
  tagline,
}: {
  title: string;
  subtitle: string;
  tagline: string;
}) {
  return (
    <section
      id="hero"
      className="starfield relative min-h-[92vh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-night)]/40 to-[var(--color-night)] pointer-events-none" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -mt-16">
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[var(--color-gold)] mb-8">
          {subtitle}
        </p>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[var(--color-pearl)] font-light leading-none mb-8 tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-moon)] mb-12 italic font-serif">
          {tagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="#classes">Join a Class</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[200px]">
            <Link href="#subscribe">Subscribe</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--color-mist)] text-xs uppercase tracking-widest animate-pulse">
        scroll
      </div>
    </section>
  );
}
