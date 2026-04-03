import { Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Sign in" };

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center font-serif text-3xl text-[var(--color-pearl)] mb-2"
        >
          Living Path
        </Link>
        <p className="text-center text-xs uppercase tracking-widest text-[var(--color-gold)] mb-12">
          Sign in to continue
        </p>

        <Suspense>
          <SignInForms searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SignInForms({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl || "/account";
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="space-y-6">
      <form
        action={async (formData: FormData) => {
          "use server";
          const email = formData.get("email") as string;
          await signIn("resend", { email, redirectTo: callbackUrl });
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Send magic link
        </Button>
      </form>

      {hasGoogle && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-veil)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-night)] px-2 text-[var(--color-mist)]">
                or
              </span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <Button type="submit" variant="outline" className="w-full" size="lg">
              Continue with Google
            </Button>
          </form>
        </>
      )}

      <p className="text-xs text-center text-[var(--color-mist)] pt-4">
        By signing in, you agree to receive emails about classes, essays, and practice.
      </p>
    </div>
  );
}
