"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        message: fd.get("message"),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage("Thank you. We'll be in touch.");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        name="name"
        required
        placeholder="Name"
        className="h-9 text-xs"
      />
      <Input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="h-9 text-xs"
      />
      <Textarea
        name="message"
        required
        placeholder="Your message"
        className="text-xs min-h-20"
      />
      <Button
        type="submit"
        size="sm"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? "Sending…" : "Send"}
      </Button>
      {message && (
        <p
          className={`text-xs ${
            status === "success" ? "text-[var(--color-gold-soft)]" : "text-rose-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
