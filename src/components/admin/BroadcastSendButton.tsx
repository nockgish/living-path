"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sendBroadcastAction } from "@/app/admin/broadcasts/actions";

export function BroadcastSendButton({
  id,
  count,
}: {
  id: string;
  count: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send() {
    if (
      !confirm(
        `Send this broadcast to ${count} active subscriber${count === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await sendBroadcastAction(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Send failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={send} disabled={pending || count === 0}>
        {pending ? "Sending…" : `Send to ${count}`}
      </Button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
