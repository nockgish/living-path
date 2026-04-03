import Link from "next/link";
import { Instagram, Youtube, BookOpen } from "lucide-react";
import { ContactForm } from "@/components/landing/ContactForm";
import type { SiteSettings } from "@prisma/client";

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const sections = [
    { id: "teachings", label: "Teachings" },
    { id: "classes", label: "Classes" },
    { id: "essays", label: "Essays" },
    { id: "lineage", label: "Lineage" },
    { id: "subscribe", label: "Subscribe" },
  ];

  return (
    <footer className="border-t border-[var(--color-veil)]/50 bg-[var(--color-ink)]/60 mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl text-[var(--color-pearl)]"
            >
              Living Path
            </Link>
            <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] mt-2">
              Himalayan Yoga · Spiritual Poetry · Nondual Teaching
            </p>
          </div>
          <div className="flex gap-5 text-[var(--color-moon)]">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-gold)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings?.substackUrl && (
              <a
                href={settings.substackUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-gold)] transition-colors"
                aria-label="Substack"
              >
                <BookOpen className="h-5 w-5" />
              </a>
            )}
            {settings?.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-gold)] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-4">
            Navigate
          </h3>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/#${s.id}`}
                  className="text-sm text-[var(--color-moon)] hover:text-[var(--color-gold-soft)]"
                >
                  {s.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/classes"
                className="text-sm text-[var(--color-moon)] hover:text-[var(--color-gold-soft)]"
              >
                Full calendar
              </Link>
            </li>
            <li>
              <Link
                href="/essays"
                className="text-sm text-[var(--color-moon)] hover:text-[var(--color-gold-soft)]"
              >
                All essays
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-4">
            Contact
          </h3>
          <ContactForm />
        </div>
      </div>
      <div className="border-t border-[var(--color-veil)]/30 py-6 text-center text-xs text-[var(--color-mist)]">
        © {new Date().getFullYear()} Living Path · All rights reserved
      </div>
    </footer>
  );
}
