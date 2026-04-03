"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BroadcastForm({
  defaults,
  action,
  submitLabel = "Save draft",
  readOnly,
}: {
  defaults?: { subject?: string; bodyHtml?: string; bodyText?: string };
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await action(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={defaults?.subject ?? ""}
          required
          disabled={readOnly}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyHtml">Body (HTML)</Label>
        <Textarea
          id="bodyHtml"
          name="bodyHtml"
          rows={16}
          defaultValue={defaults?.bodyHtml ?? ""}
          className="font-mono text-xs"
          required
          disabled={readOnly}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyText">Plain text fallback (optional)</Label>
        <Textarea
          id="bodyText"
          name="bodyText"
          rows={4}
          defaultValue={defaults?.bodyText ?? ""}
          disabled={readOnly}
        />
      </div>

      {error && (
        <p className="text-sm text-red-300 border border-red-900/60 bg-red-900/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      {!readOnly && (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      )}
    </form>
  );
}
