import Link from "next/link";

export const metadata = { title: "Check your email" };

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Link
          href="/"
          className="block font-serif text-3xl text-[var(--color-pearl)]"
        >
          Living Path
        </Link>
        <div className="border border-[var(--color-veil)] bg-[var(--color-night-2)]/60 rounded-lg p-10">
          <h1 className="font-serif text-2xl text-[var(--color-pearl)] mb-3">
            Check your email
          </h1>
          <p className="text-[var(--color-moon)] text-sm leading-relaxed">
            A sign-in link is on its way. Click it to continue.
          </p>
          <p className="text-xs text-[var(--color-mist)] mt-6">
            The link is valid for 24 hours. You can close this window.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
        >
          ← Return home
        </Link>
      </div>
    </div>
  );
}
