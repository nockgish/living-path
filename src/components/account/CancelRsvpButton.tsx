"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CancelRsvpButton({
  classEventId,
  occurrence,
}: {
  classEventId: string;
  occurrence: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function cancel() {
    startTransition(async () => {
      await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classEventId, occurrence }),
      });
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={cancel} disabled={pending}>
      {pending ? "…" : "Cancel"}
    </Button>
  );
}
