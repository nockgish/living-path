import Link from "next/link";
import { Calendar, ShoppingBag, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function AccountDashboard() {
  const user = await requireUser();

  const [membership, recentRsvps, recentPurchases] = await Promise.all([
    prisma.membership.findUnique({ where: { userId: user.id } }),
    prisma.rSVP.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { classEvent: true },
    }),
    prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const isMembershipActive =
    membership?.status === "active" || membership?.status === "trialing";

  return (
    <div className="space-y-12">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Welcome
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          {user.name ?? user.email}
        </h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-gold)]" />
              Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isMembershipActive ? (
              <div>
                <p className="text-sm text-[var(--color-gold-soft)] mb-2 capitalize">
                  {membership.status}
                </p>
                <p className="text-xs text-[var(--color-mist)]">
                  Renews {formatDate(membership.currentPeriodEnd)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[var(--color-mist)] mb-3">
                  No active membership.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/account/membership">View plans</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--color-gold)]" />
              RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif text-[var(--color-pearl)] mb-2">
              {recentRsvps.length}
            </p>
            <Link
              href="/account/calendar"
              className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
            >
              View calendar →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[var(--color-gold)]" />
              Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif text-[var(--color-pearl)] mb-2">
              {recentPurchases.length}
            </p>
            <Link
              href="/account/purchases"
              className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
            >
              View all →
            </Link>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="font-serif text-2xl text-[var(--color-pearl)] mb-4">
          Upcoming
        </h2>
        {recentRsvps.length === 0 ? (
          <p className="text-sm text-[var(--color-mist)]">
            No RSVPs yet.{" "}
            <Link
              href="/classes"
              className="text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
            >
              Browse classes →
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {recentRsvps.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-4"
              >
                <div>
                  <p className="font-serif text-lg text-[var(--color-pearl)]">
                    {r.classEvent.title}
                  </p>
                  <p className="text-xs text-[var(--color-gold)]">
                    {formatDateTime(r.occurrence ?? r.classEvent.startsAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentPurchases.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl text-[var(--color-pearl)] mb-4">
            Recent purchases
          </h2>
          <ul className="space-y-3">
            {recentPurchases.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-4"
              >
                <div>
                  <p className="text-sm text-[var(--color-moon)] capitalize">
                    {p.itemType}
                  </p>
                  <p className="text-xs text-[var(--color-mist)]">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <p className="font-serif text-lg text-[var(--color-gold)]">
                  {formatPrice(p.amount)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
