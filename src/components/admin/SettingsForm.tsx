"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Defaults = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroTagline?: string;
  lineageBody?: string;
  instagramUrl?: string | null;
  substackUrl?: string | null;
  youtubeUrl?: string | null;
  contactEmail?: string | null;
};

export function SettingsForm({
  defaults,
  action,
}: {
  defaults?: Defaults;
  action: (formData: FormData) => Promise<void>;
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
    <form action={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-[var(--color-gold-soft)]">Hero</h2>
        <div className="space-y-2">
          <Label htmlFor="heroTitle">Title</Label>
          <Input
            id="heroTitle"
            name="heroTitle"
            defaultValue={defaults?.heroTitle ?? "Living Path"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">Subtitle</Label>
          <Input
            id="heroSubtitle"
            name="heroSubtitle"
            defaultValue={
              defaults?.heroSubtitle ??
              "Himalayan Yoga · Spiritual Poetry · Nondual Teaching"
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroTagline">Tagline</Label>
          <Input
            id="heroTagline"
            name="heroTagline"
            defaultValue={
              defaults?.heroTagline ?? "Himalayan Yoga in the here and now"
            }
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl text-[var(--color-gold-soft)]">
          Lineage
        </h2>
        <div className="space-y-2">
          <Label htmlFor="lineageBody">Lineage body</Label>
          <Textarea
            id="lineageBody"
            name="lineageBody"
            rows={10}
            defaultValue={defaults?.lineageBody ?? ""}
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl text-[var(--color-gold-soft)]">
          Links & contact
        </h2>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={defaults?.instagramUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="substackUrl">Substack URL</Label>
          <Input
            id="substackUrl"
            name="substackUrl"
            type="url"
            defaultValue={defaults?.substackUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl">YouTube URL</Label>
          <Input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            defaultValue={defaults?.youtubeUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={defaults?.contactEmail ?? ""}
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-300 border border-red-900/60 bg-red-900/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-veil)]/40">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {saved && (
          <span className="text-sm text-[var(--color-gold-soft)]">Saved ✓</span>
        )}
      </div>
    </form>
  );
}
