import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MembershipActions } from "@/components/account/MembershipActions";

export const metadata = { title: "Membership" };

const PLANS = [
  {
    id: "monthly" as const,
    name: "Monthly",
    description: "Unlimited classes, billed monthly.",
    price: "$24",
    cadence: "/ month",
  },
  {
    id: "annual" as const,
    name: "Annual",
    description: "Unlimited classes, billed yearly. Two months free.",
    price: "$240",
    cadence: "/ year",
  },
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const membership = await prisma.membership.findUnique({
    where: { userId: user.id },
  });
  const isActive = membership?.status === "active" || membership?.status === "trialing";

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Practice Membership
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Membership</h1>
      </header>

      {sp.success && (
        <div className="rounded border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-4 text-sm text-[var(--color-gold-soft)]">
          Welcome to the practice. Your membership is active.
        </div>
      )}
      {sp.canceled && (
        <div className="rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/60 p-4 text-sm text-[var(--color-mist)]">
          Checkout was canceled. You can subscribe at any time.
        </div>
      )}

      {isActive && membership ? (
        <Card>
          <CardHeader>
            <CardTitle>You are a member.</CardTitle>
            <CardDescription>
              {membership.cancelAtPeriodEnd
                ? `Cancels on ${formatDate(membership.currentPeriodEnd)}`
                : `Renews on ${formatDate(membership.currentPeriodEnd)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipActions hasActiveMembership />
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl text-[var(--color-pearl)] mb-1">
                  {plan.price}
                  <span className="text-sm text-[var(--color-mist)]">{plan.cadence}</span>
                </p>
                <MembershipActions plan={plan.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
