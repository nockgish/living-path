"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-3">
          Disturbance
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)] mb-4">
          Something stirred unexpectedly
        </h1>
        <p className="text-sm text-[var(--color-mist)] mb-8">
          We&apos;ve noted what happened. You can try again, or return home.
        </p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={reset}
            className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
          >
            Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
