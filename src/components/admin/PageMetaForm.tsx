"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PageMetaForm({
  defaults,
  action,
  disableSlug,
}: {
  defaults?: { title?: string; slug?: string; description?: string | null };
  action: (formData: FormData) => Promise<void>;
  disableSlug?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setSaved(false);
    setError(null);
    try {
      await action(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
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
          disabled={disableSlug}
        />
        {disableSlug && (
          <p className="text-xs text-[var(--color-mist)]">
            Built-in page slug is locked.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (SEO)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
        />
      </div>
      {error && (
        <p className="text-sm text-red-300 border border-red-900/60 bg-red-900/20 rounded px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save metadata"}
        </Button>
        {saved && (
          <span className="text-sm text-[var(--color-gold-soft)]">Saved ✓</span>
        )}
      </div>
    </form>
  );
}
