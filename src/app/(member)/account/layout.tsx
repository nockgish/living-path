import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Role } from "@prisma/client";

const NAV = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/calendar", label: "My Calendar" },
  { href: "/account/purchases", label: "Purchases" },
  { href: "/account/membership", label: "Membership" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  const isAdmin = session.user.role === Role.ADMIN;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-veil)]/50 bg-[var(--color-night)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-pearl)] hover:text-[var(--color-gold-soft)]"
          >
            Living Path
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-xs uppercase tracking-widest text-[var(--color-moon)] hover:text-[var(--color-gold-soft)]"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs uppercase tracking-widest text-[var(--color-gold)] hover:text-[var(--color-gold-soft)] border border-[var(--color-gold)]/40 px-3 py-1 rounded"
              >
                Admin
              </Link>
            )}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-xs uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-gold-soft)]">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">{children}</main>
    </div>
  );
}
