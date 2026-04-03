import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

interface RawItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  "content:encoded"?: string;
  guid?: string | { "#text": string };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  textNodeName: "#text",
});

function getText(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    if ("__cdata" in v) return String((v as { __cdata: unknown }).__cdata);
    if ("#text" in v) return String((v as { "#text": unknown })["#text"]);
  }
  return "";
}

function makeExcerpt(html: string, maxLen = 220) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).replace(/\s\S*$/, "") + "…" : text;
}

const SAFE_HTML: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "i", "b", "u",
    "blockquote", "ul", "ol", "li", "a", "img", "code", "pre", "hr", "figure",
    "figcaption", "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
    }),
  },
};

export async function syncSubstack(): Promise<{ created: number; updated: number; total: number }> {
  const baseUrl = process.env.SUBSTACK_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("SUBSTACK_URL not configured");
  }
  const feedUrl = `${baseUrl}/feed`;
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "Living Path RSS Sync" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Substack feed fetch failed: ${res.status}`);
  }
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const items: RawItem[] = parsed?.rss?.channel?.item ?? [];
  const itemsArr = Array.isArray(items) ? items : [items];

  let created = 0;
  let updated = 0;

  for (const item of itemsArr) {
    if (!item) continue;
    const title = getText(item.title);
    const link = getText(item.link);
    if (!title || !link) continue;

    const rawHtml = getText(item["content:encoded"]) || getText(item.description);
    const contentHtml = sanitizeHtml(rawHtml, SAFE_HTML);
    const excerpt = makeExcerpt(rawHtml);
    const publishedAt = item.pubDate ? new Date(getText(item.pubDate)) : new Date();
    const slug = slugify(title);

    // Match against substackUrl OR slug to avoid dupes
    const existing = await prisma.essay.findFirst({
      where: { OR: [{ substackUrl: link }, { slug }] },
    });

    if (existing) {
      await prisma.essay.update({
        where: { id: existing.id },
        data: {
          title,
          excerpt,
          contentHtml,
          publishedAt,
          source: "substack",
          substackUrl: link,
        },
      });
      updated++;
    } else {
      await prisma.essay.create({
        data: {
          slug,
          title,
          excerpt,
          contentHtml,
          publishedAt,
          source: "substack",
          substackUrl: link,
        },
      });
      created++;
    }
  }

  return { created, updated, total: itemsArr.length };
}
