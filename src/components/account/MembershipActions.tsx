"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props =
  | { hasActiveMembership: true; plan?: never }
  | { hasActiveMembership?: false; plan: "monthly" | "annual" };

export function MembershipActions(props: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(path: string, body?: unknown) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error");
      setPending(false);
    }
  }

  if (props.hasActiveMembership) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => go("/api/stripe/portal")}
          disabled={pending}
        >
          {pending ? "Opening…" : "Manage billing"}
        </Button>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={() =>
          go("/api/stripe/checkout", { kind: "membership", plan: props.plan })
        }
        disabled={pending}
        className="w-full"
      >
        {pending ? "Redirecting…" : "Subscribe"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
