"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Defaults = {
  title?: string;
  description?: string;
  startsAt?: Date | string;
  endsAt?: Date | string;
  isWorkshop?: boolean;
  priceCents?: number | null;
  capacity?: number | null;
  location?: string | null;
  zoomUrl?: string | null;
  recurring?: string | null;
  imageUrl?: string | null;
  published?: boolean;
};

function toLocalInput(d?: Date | string): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ClassForm({
  defaults,
  action,
  submitLabel = "Save",
  onDelete,
}: {
  defaults?: Defaults;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  onDelete?: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWorkshop, setIsWorkshop] = useState(!!defaults?.isWorkshop);

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
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaults?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={defaults?.description ?? ""}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toLocalInput(defaults?.startsAt)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends at</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInput(defaults?.endsAt)}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="Zoom or studio address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zoomUrl">Zoom URL</Label>
          <Input
            id="zoomUrl"
            name="zoomUrl"
            type="url"
            defaultValue={defaults?.zoomUrl ?? ""}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={defaults?.capacity ?? ""}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurring">Recurring (RRULE)</Label>
          <Input
            id="recurring"
            name="recurring"
            defaultValue={defaults?.recurring ?? ""}
            placeholder="FREQ=WEEKLY;BYDAY=MO"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={defaults?.imageUrl ?? ""}
        />
      </div>

      <div className="space-y-3 rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-4">
        <label className="flex items-center gap-3 text-sm text-[var(--color-pearl)]">
          <input
            type="checkbox"
            name="isWorkshop"
            checked={isWorkshop}
            onChange={(e) => setIsWorkshop(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-gold)]"
          />
          This is a workshop (paid, one-time)
        </label>
        {isWorkshop && (
          <div className="space-y-2">
            <Label htmlFor="priceCents">Price (USD)</Label>
            <Input
              id="priceCents"
              name="priceCents"
              type="number"
              step="0.01"
              min={0}
              defaultValue={
                defaults?.priceCents != null ? defaults.priceCents / 100 : ""
              }
              placeholder="65.00"
            />
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 text-sm text-[var(--color-pearl)]">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaults?.published ?? true}
          className="h-4 w-4 accent-[var(--color-gold)]"
        />
        Published (visible publicly)
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
              if (!confirm("Delete this class? This will remove all RSVPs.")) return;
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
