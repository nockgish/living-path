"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Block, BlockType } from "@/lib/blocks";

export function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Block["data"]) => void;
}) {
  const update = (patch: Record<string, unknown>) =>
    onChange({ ...(block.data as Record<string, unknown>), ...patch } as Block["data"]);

  switch (block.type) {
    case "hero": {
      const d = block.data as { title: string; subtitle?: string; image?: string; ctaLabel?: string; ctaHref?: string };
      return (
        <div className="space-y-3">
          <Field label="Title">
            <Input value={d.title ?? ""} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <Input value={d.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} />
          </Field>
          <Field label="Image URL">
            <Input value={d.image ?? ""} onChange={(e) => update({ image: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA label">
              <Input value={d.ctaLabel ?? ""} onChange={(e) => update({ ctaLabel: e.target.value })} />
            </Field>
            <Field label="CTA href">
              <Input value={d.ctaHref ?? ""} onChange={(e) => update({ ctaHref: e.target.value })} />
            </Field>
          </div>
        </div>
      );
    }
    case "prose": {
      const d = block.data as { html: string };
      return (
        <Field label="HTML">
          <Textarea
            rows={10}
            value={d.html ?? ""}
            onChange={(e) => update({ html: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>
      );
    }
    case "image": {
      const d = block.data as { url: string; alt?: string; caption?: string };
      return (
        <div className="space-y-3">
          <Field label="Image URL">
            <Input value={d.url ?? ""} onChange={(e) => update({ url: e.target.value })} />
          </Field>
          <Field label="Alt text">
            <Input value={d.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} />
          </Field>
          <Field label="Caption">
            <Input value={d.caption ?? ""} onChange={(e) => update({ caption: e.target.value })} />
          </Field>
        </div>
      );
    }
    case "quote": {
      const d = block.data as { text: string; attribution?: string };
      return (
        <div className="space-y-3">
          <Field label="Quote">
            <Textarea rows={3} value={d.text ?? ""} onChange={(e) => update({ text: e.target.value })} />
          </Field>
          <Field label="Attribution">
            <Input value={d.attribution ?? ""} onChange={(e) => update({ attribution: e.target.value })} />
          </Field>
        </div>
      );
    }
    case "gallery": {
      const d = block.data as { images: Array<{ url: string; alt?: string }> };
      const images = d.images ?? [];
      return (
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={img.url}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i], url: e.target.value };
                  update({ images: next });
                }}
              />
              <Input
                placeholder="Alt"
                value={img.alt ?? ""}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i], alt: e.target.value };
                  update({ images: next });
                }}
              />
              <button
                type="button"
                onClick={() => update({ images: images.filter((_, j) => j !== i) })}
                className="px-2 text-xs text-red-300 hover:text-red-200"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ images: [...images, { url: "", alt: "" }] })}
            className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
          >
            + Add image
          </button>
        </div>
      );
    }
    case "video": {
      const d = block.data as { url: string; caption?: string };
      return (
        <div className="space-y-3">
          <Field label="Video URL (YouTube/Vimeo)">
            <Input value={d.url ?? ""} onChange={(e) => update({ url: e.target.value })} />
          </Field>
          <Field label="Caption">
            <Input value={d.caption ?? ""} onChange={(e) => update({ caption: e.target.value })} />
          </Field>
        </div>
      );
    }
    case "cta": {
      const d = block.data as { title: string; body?: string; buttonLabel: string; buttonHref: string };
      return (
        <div className="space-y-3">
          <Field label="Title">
            <Input value={d.title ?? ""} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label="Body">
            <Textarea rows={3} value={d.body ?? ""} onChange={(e) => update({ body: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button label">
              <Input value={d.buttonLabel ?? ""} onChange={(e) => update({ buttonLabel: e.target.value })} />
            </Field>
            <Field label="Button href">
              <Input value={d.buttonHref ?? ""} onChange={(e) => update({ buttonHref: e.target.value })} />
            </Field>
          </div>
        </div>
      );
    }
    case "embed": {
      const d = block.data as { html: string };
      return (
        <Field label="HTML / iframe">
          <Textarea
            rows={6}
            value={d.html ?? ""}
            onChange={(e) => update({ html: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>
      );
    }
    case "classList": {
      const d = block.data as { filter: "upcoming" | "all" | "workshops"; limit: number };
      return (
        <div className="space-y-3">
          <Field label="Filter">
            <select
              value={d.filter}
              onChange={(e) => update({ filter: e.target.value })}
              className="w-full h-10 px-3 rounded-md bg-[var(--color-night-2)] border border-[var(--color-veil)] text-sm text-[var(--color-pearl)]"
            >
              <option value="upcoming">Upcoming</option>
              <option value="workshops">Workshops only</option>
              <option value="all">All</option>
            </select>
          </Field>
          <Field label="Limit">
            <Input
              type="number"
              min={1}
              max={20}
              value={d.limit}
              onChange={(e) => update({ limit: Number(e.target.value) })}
            />
          </Field>
        </div>
      );
    }
    case "essayList": {
      const d = block.data as { source: "all" | "native" | "substack"; limit: number };
      return (
        <div className="space-y-3">
          <Field label="Source">
            <select
              value={d.source}
              onChange={(e) => update({ source: e.target.value })}
              className="w-full h-10 px-3 rounded-md bg-[var(--color-night-2)] border border-[var(--color-veil)] text-sm text-[var(--color-pearl)]"
            >
              <option value="all">All</option>
              <option value="native">Native only</option>
              <option value="substack">Substack only</option>
            </select>
          </Field>
          <Field label="Limit">
            <Input
              type="number"
              min={1}
              max={20}
              value={d.limit}
              onChange={(e) => update({ limit: Number(e.target.value) })}
            />
          </Field>
        </div>
      );
    }
    case "divider": {
      const d = block.data as { style: "thin" | "ornament" };
      return (
        <Field label="Style">
          <select
            value={d.style}
            onChange={(e) => update({ style: e.target.value })}
            className="w-full h-10 px-3 rounded-md bg-[var(--color-night-2)] border border-[var(--color-veil)] text-sm text-[var(--color-pearl)]"
          >
            <option value="ornament">Ornament</option>
            <option value="thin">Thin line</option>
          </select>
        </Field>
      );
    }
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-widest text-[var(--color-mist)]">
        {label}
      </Label>
      {children}
    </div>
  );
}

export type { BlockType };
