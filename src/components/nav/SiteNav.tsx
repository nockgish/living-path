"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "teachings", label: "Teachings" },
  { id: "classes", label: "Classes" },
  { id: "essays", label: "Essays" },
  { id: "lineage", label: "Lineage" },
  { id: "subscribe", label: "Subscribe" },
];

export function SiteNav({ isLandingPage = false }: { isLandingPage?: boolean }) {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLandingPage) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75] }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isLandingPage]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || !isLandingPage
          ? "bg-[var(--color-night)]/90 backdrop-blur-md border-b border-[var(--color-veil)]/50"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl text-[var(--color-pearl)] tracking-wide hover:text-[var(--color-gold-soft)] transition-colors"
        >
          Living Path
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <Link
                href={isLandingPage ? `#${section.id}` : `/#${section.id}`}
                className={cn(
                  "text-xs uppercase tracking-widest transition-colors",
                  active === section.id
                    ? "text-[var(--color-gold)]"
                    : "text-[var(--color-moon)] hover:text-[var(--color-gold-soft)]"
                )}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/account"
          className="text-xs uppercase tracking-widest text-[var(--color-moon)] hover:text-[var(--color-gold-soft)] transition-colors"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
