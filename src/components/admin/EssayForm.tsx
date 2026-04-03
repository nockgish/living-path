"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EssayDefaults = {
  title?: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  coverImage?: string | null;
  publishedAt?: Date | null;
};

export function EssayForm({
  defaults,
  action,
  submitLabel = "Save",
  onDelete,
}: {
  defaults?: EssayDefaults;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  onDelete?: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await action(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={defaults?.slug ?? ""}
          placeholder="auto-generated from title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={defaults?.excerpt ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover image URL</Label>
        <Input
          id="coverImage"
          name="coverImage"
          type="url"
          defaultValue={defaults?.coverImage ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentHtml">Content (HTML)</Label>
        <Textarea
          id="contentHtml"
          name="contentHtml"
          rows={20}
          defaultValue={defaults?.contentHtml ?? ""}
          className="font-mono text-xs"
        />
        <p className="text-xs text-[var(--color-mist)]">
          Paste HTML or write paragraphs in &lt;p&gt; tags. Sanitized on render.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm text-[var(--color-pearl)]">
        <input
          type="checkbox"
          name="publish"
          defaultChecked={!!defaults?.publishedAt}
          className="h-4 w-4 accent-[var(--color-gold)]"
        />
        Published
      </label>

      {error && (
        <p className="text-sm text-red-300 border border-red-900/60 bg-red-900/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-veil)]/40">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              if (!confirm("Delete this essay? This cannot be undone.")) return;
              setPending(true);
              try {
                await onDelete();
              } finally {
                setPending(false);
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
