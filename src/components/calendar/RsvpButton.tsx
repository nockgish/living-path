"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function RsvpButton({
  classEventId,
  occurrence,
  hasRsvp: initialHasRsvp,
}: {
  classEventId: string;
  occurrence: string | null;
  hasRsvp: boolean;
}) {
  const [hasRsvp, setHasRsvp] = useState(initialHasRsvp);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle() {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/rsvp", {
        method: hasRsvp ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classEventId, occurrence }),
      });
      if (res.ok) {
        setHasRsvp(!hasRsvp);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant={hasRsvp ? "secondary" : "default"}
        onClick={toggle}
        disabled={pending}
      >
        {pending ? "…" : hasRsvp ? "✓ Going · Cancel" : "RSVP"}
      </Button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
