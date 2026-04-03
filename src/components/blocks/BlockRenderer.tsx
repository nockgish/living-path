import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import type { Block } from "@/lib/blocks";
import { Button } from "@/components/ui/button";

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "i", "b", "u",
    "blockquote", "ul", "ol", "li", "a", "img", "code", "pre", "hr", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

const EMBED_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ["iframe", "div", "p", "a", "span", "br"],
  allowedAttributes: {
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
    a: ["href", "target", "rel"],
    div: ["class"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https"],
  allowedIframeHostnames: [
    "www.youtube.com", "youtube.com", "player.vimeo.com",
    "open.spotify.com", "w.soundcloud.com",
  ],
};

export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-16">
      {await Promise.all(blocks.map(async (b) => renderBlock(b)))}
    </div>
  );
}

async function renderBlock(b: Block): Promise<React.ReactNode> {
  switch (b.type) {
    case "hero":
      return (
        <section key={b.id} className="text-center py-20 px-6 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--color-pearl)] font-light mb-6 leading-tight">
            {b.data.title}
          </h1>
          {b.data.subtitle && (
            <p className="text-xl text-[var(--color-moon)] italic font-serif mb-8">
              {b.data.subtitle}
            </p>
          )}
          {b.data.ctaLabel && b.data.ctaHref && (
            <Button asChild size="lg">
              <Link href={b.data.ctaHref}>{b.data.ctaLabel}</Link>
            </Button>
          )}
        </section>
      );

    case "prose":
      return (
        <div
          key={b.id}
          className="prose-living max-w-3xl mx-auto px-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.data.html, SANITIZE_OPTS) }}
        />
      );

    case "image":
      return (
        <figure key={b.id} className="max-w-4xl mx-auto px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.data.url}
            alt={b.data.alt}
            className="w-full rounded-lg border border-[var(--color-veil)]"
          />
          {b.data.caption && (
            <figcaption className="text-center text-sm text-[var(--color-mist)] mt-3 italic">
              {b.data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote
          key={b.id}
          className="max-w-3xl mx-auto px-6 text-center py-8"
        >
          <p className="font-serif text-2xl md:text-3xl text-[var(--color-pearl)] italic leading-relaxed mb-4">
            &ldquo;{b.data.text}&rdquo;
          </p>
          {b.data.attribution && (
            <footer className="text-xs uppercase tracking-widest text-[var(--color-gold)]">
              — {b.data.attribution}
            </footer>
          )}
        </blockquote>
      );

    case "gallery":
      return (
        <div
          key={b.id}
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {b.data.images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img.url}
              alt={img.alt}
              className="w-full aspect-square object-cover rounded border border-[var(--color-veil)]"
            />
          ))}
        </div>
      );

    case "video":
      return (
        <figure key={b.id} className="max-w-4xl mx-auto px-6">
          <div className="aspect-video">
            <iframe
              src={toEmbedUrl(b.data.url)}
              className="w-full h-full rounded-lg border border-[var(--color-veil)]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {b.data.caption && (
            <figcaption className="text-center text-sm text-[var(--color-mist)] mt-3">
              {b.data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "cta":
      return (
        <div
          key={b.id}
          className="max-w-3xl mx-auto px-6"
        >
          <div className="rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-night-2)] p-10 text-center">
            <h3 className="font-serif text-3xl text-[var(--color-pearl)] mb-3">
              {b.data.title}
            </h3>
            {b.data.body && (
              <p className="text-[var(--color-moon)] mb-6">{b.data.body}</p>
            )}
            <Button asChild size="lg">
              <Link href={b.data.buttonHref}>{b.data.buttonLabel}</Link>
            </Button>
          </div>
        </div>
      );

    case "embed":
      return (
        <div
          key={b.id}
          className="max-w-3xl mx-auto px-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.data.html, EMBED_SANITIZE) }}
        />
      );

    case "classList": {
      const where: { published: boolean; startsAt?: { gte: Date }; isWorkshop?: boolean } = { published: true };
      if (b.data.filter === "upcoming") where.startsAt = { gte: new Date() };
      if (b.data.filter === "workshops") where.isWorkshop = true;
      const classes = await prisma.classEvent.findMany({
        where,
        orderBy: { startsAt: "asc" },
        take: b.data.limit,
      });
      return (
        <div key={b.id} className="max-w-4xl mx-auto px-6 space-y-4">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-[var(--color-veil)] bg-[var(--color-night-2)]/60 p-5"
            >
              <h4 className="font-serif text-xl text-[var(--color-pearl)]">{c.title}</h4>
              <p className="text-xs text-[var(--color-gold)] mt-1">
                {formatDateTime(c.startsAt)}
                {c.priceCents != null && ` · ${formatPrice(c.priceCents)}`}
              </p>
            </div>
          ))}
        </div>
      );
    }

    case "essayList": {
      const where: { publishedAt: { lte: Date }; source?: string } = {
        publishedAt: { lte: new Date() },
      };
      if (b.data.source !== "all") where.source = b.data.source;
      const essays = await prisma.essay.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: b.data.limit,
      });
      return (
        <div
          key={b.id}
          className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6"
        >
          {essays.map((e) => (
            <Link key={e.id} href={`/essays/${e.slug}`} className="group block">
              {e.publishedAt && (
                <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-2">
                  {formatDate(e.publishedAt)}
                </p>
              )}
              <h4 className="font-serif text-xl text-[var(--color-pearl)] group-hover:text-[var(--color-gold-soft)] transition-colors">
                {e.title}
              </h4>
              <p className="text-sm text-[var(--color-moon)] mt-2 line-clamp-2">
                {e.excerpt}
              </p>
            </Link>
          ))}
        </div>
      );
    }

    case "divider":
      return (
        <div key={b.id} className="max-w-3xl mx-auto px-6 py-4 text-center">
          {b.data.style === "ornament" ? (
            <span className="text-[var(--color-gold)]/60 text-2xl tracking-[0.5em]">
              ❖ ❖ ❖
            </span>
          ) : (
            <hr className="border-[var(--color-veil)]" />
          )}
        </div>
      );
  }
}

function toEmbedUrl(url: string) {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}
