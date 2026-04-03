import { z } from "zod";

// =============================================================
// Block schemas — single source of truth for the page builder
// =============================================================

export const BlockSchemas = {
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional().default(""),
    image: z.string().url().optional().or(z.literal("")),
    ctaLabel: z.string().optional().default(""),
    ctaHref: z.string().optional().default(""),
  }),
  prose: z.object({
    html: z.string().min(1),
  }),
  image: z.object({
    url: z.string().url(),
    alt: z.string().optional().default(""),
    caption: z.string().optional().default(""),
  }),
  quote: z.object({
    text: z.string().min(1),
    attribution: z.string().optional().default(""),
  }),
  gallery: z.object({
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional().default(""),
        })
      )
      .min(1),
  }),
  video: z.object({
    url: z.string().url(),
    caption: z.string().optional().default(""),
  }),
  cta: z.object({
    title: z.string().min(1),
    body: z.string().optional().default(""),
    buttonLabel: z.string().min(1),
    buttonHref: z.string().min(1),
  }),
  embed: z.object({
    html: z.string().min(1),
  }),
  classList: z.object({
    filter: z.enum(["upcoming", "all", "workshops"]).default("upcoming"),
    limit: z.number().int().min(1).max(20).default(4),
  }),
  essayList: z.object({
    limit: z.number().int().min(1).max(20).default(3),
    source: z.enum(["all", "native", "substack"]).default("all"),
  }),
  divider: z.object({
    style: z.enum(["thin", "ornament"]).default("ornament"),
  }),
} as const;

export type BlockType = keyof typeof BlockSchemas;

export type Block = {
  [K in BlockType]: {
    id: string;
    type: K;
    data: z.infer<(typeof BlockSchemas)[K]>;
  };
}[BlockType];

// =============================================================
// Editor metadata — drives the admin block-picker UI
// =============================================================

export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string; icon: string }
> = {
  hero: { label: "Hero", description: "Title + subtitle banner", icon: "✦" },
  prose: { label: "Rich Text", description: "Long-form prose", icon: "¶" },
  image: { label: "Image", description: "Single image with caption", icon: "▢" },
  quote: { label: "Quote", description: "Pull quote with attribution", icon: "❝" },
  gallery: { label: "Gallery", description: "Image grid", icon: "▦" },
  video: { label: "Video", description: "YouTube or Vimeo embed", icon: "▶" },
  cta: { label: "CTA", description: "Call-to-action card", icon: "→" },
  embed: { label: "Embed", description: "Custom HTML / iframe (admin only)", icon: "</>" },
  classList: { label: "Classes", description: "Live class list", icon: "◧" },
  essayList: { label: "Essays", description: "Live essay list", icon: "✎" },
  divider: { label: "Divider", description: "Section break", icon: "—" },
};

export function defaultBlockData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { title: "New Hero", subtitle: "", image: "", ctaLabel: "", ctaHref: "" };
    case "prose":
      return { html: "<p>Write here…</p>" };
    case "image":
      return { url: "", alt: "", caption: "" };
    case "quote":
      return { text: "Quote text", attribution: "" };
    case "gallery":
      return { images: [{ url: "", alt: "" }] };
    case "video":
      return { url: "", caption: "" };
    case "cta":
      return { title: "Call to action", body: "", buttonLabel: "Learn more", buttonHref: "/" };
    case "embed":
      return { html: "<!-- HTML here -->" };
    case "classList":
      return { filter: "upcoming", limit: 4 };
    case "essayList":
      return { limit: 3, source: "all" };
    case "divider":
      return { style: "ornament" };
  }
}

export function validateBlocks(blocks: unknown): Block[] {
  if (!Array.isArray(blocks)) return [];
  const valid: Block[] = [];
  for (const b of blocks) {
    if (
      !b ||
      typeof b !== "object" ||
      !("type" in b) ||
      !("data" in b) ||
      !("id" in b)
    )
      continue;
    const type = (b as { type: string }).type;
    if (!(type in BlockSchemas)) continue;
    const schema = BlockSchemas[type as BlockType];
    const parsed = schema.safeParse((b as { data: unknown }).data);
    if (parsed.success) {
      valid.push({
        id: String((b as { id: string }).id),
        type: type as BlockType,
        data: parsed.data,
      } as Block);
    }
  }
  return valid;
}
