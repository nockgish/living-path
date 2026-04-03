"use client";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function BuyWorkshopButton({ classEventId }: { classEventId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function buy() {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "workshop", classEventId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button size="sm" onClick={buy} disabled={pending}>
        {pending ? "…" : "Purchase"}
      </Button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
