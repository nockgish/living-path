import Link from "next/link";
import { requireAdmin } from "@/lib/rbac";
import { signOut } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/essays", label: "Essays" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/classes", label: "Calendar" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/broadcasts", label: "Broadcasts" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[var(--color-veil)]/40 bg-[var(--color-night)]/95 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-[var(--color-veil)]/40">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-pearl)] hover:text-[var(--color-gold-soft)] block"
          >
            Living Path
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] mt-1">
            Admin
          </p>
        </div>
        <nav className="p-4 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-3 py-2 rounded text-sm text-[var(--color-moon)] hover:text-[var(--color-pearl)] hover:bg-[var(--color-night-3)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-veil)]/40 mt-auto">
          <Link
            href="/account"
            className="block px-3 py-2 text-xs uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-gold-soft)]"
          >
            ← Back to account
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full text-left px-3 py-2 text-xs uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-gold-soft)]">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-10 max-w-6xl">{children}</main>
    </div>
  );
}
