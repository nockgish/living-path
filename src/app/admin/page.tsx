import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin · Overview" };

export default async function AdminOverview() {
  const [
    memberCount,
    activeMemberships,
    subscriberCount,
    upcomingClasses,
    essayCount,
    pageCount,
    unreadMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.membership.count({
      where: { status: { in: ["active", "trialing"] } },
    }),
    prisma.subscriber.count({ where: { status: "active" } }),
    prisma.classEvent.count({ where: { startsAt: { gte: new Date() } } }),
    prisma.essay.count(),
    prisma.page.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  const stats = [
    { label: "Active Memberships", value: activeMemberships, href: "/admin/members" },
    { label: "Total Users", value: memberCount, href: "/admin/members" },
    { label: "Subscribers", value: subscriberCount, href: "/admin/subscribers" },
    { label: "Upcoming Classes", value: upcomingClasses, href: "/admin/classes" },
    { label: "Essays", value: essayCount, href: "/admin/essays" },
    { label: "Pages", value: pageCount, href: "/admin/pages" },
    { label: "Unread Messages", value: unreadMessages, href: "/admin/messages" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Dashboard
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Overview</h1>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-[var(--color-gold)]/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest text-[var(--color-mist)]">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-4xl text-[var(--color-pearl)]">
                  {s.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-2xl text-[var(--color-pearl)] mb-4">
          Quick actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickLink href="/admin/essays/new" label="New essay" />
          <QuickLink href="/admin/pages/new" label="New page" />
          <QuickLink href="/admin/classes/new" label="New class or workshop" />
          <QuickLink href="/admin/broadcasts/new" label="Compose broadcast" />
        </div>
      </section>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-4 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-night-3)]/50 transition-colors"
    >
      <span className="text-sm text-[var(--color-pearl)]">{label}</span>
      <span className="text-[var(--color-gold)] float-right">→</span>
    </Link>
  );
}
