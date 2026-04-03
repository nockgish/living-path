import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-3">
          404
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)] mb-4">
          Lost in the silence
        </h1>
        <p className="text-sm text-[var(--color-mist)] mb-8">
          This page does not exist, or has gone to sit in stillness.
        </p>
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
        >
          Return home →
        </Link>
      </div>
    </div>
  );
}
