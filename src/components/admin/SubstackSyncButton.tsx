"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SubstackSyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function sync() {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/substack/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error ?? "Sync failed");
        return;
      }
      setMsg(
        `Synced: ${data.created ?? 0} new, ${data.updated ?? 0} updated`
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={sync} disabled={pending}>
        {pending ? "Syncing…" : "Sync Substack"}
      </Button>
      {msg && <p className="text-xs text-[var(--color-mist)]">{msg}</p>}
    </div>
  );
}
