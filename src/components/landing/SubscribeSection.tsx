"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "./SectionHeading";

export function SubscribeSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        name: formData.get("name"),
        source: "landing",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(data.message ?? "You are subscribed.");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  return (
    <section id="subscribe" className="py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <SectionHeading
          eyebrow="Stay In Touch"
          title="Subscribe"
          description="Class reminders, new essays, and notes from the practice. No noise."
        />

        <form onSubmit={onSubmit} className="space-y-4 mt-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="name"
              placeholder="Your name"
              autoComplete="name"
            />
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </Button>
          {message && (
            <p
              className={`text-sm pt-2 ${
                status === "success"
                  ? "text-[var(--color-gold-soft)]"
                  : "text-rose-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
