import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin · Members" };

export default async function AdminMembers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { membership: true },
  });

  const active = users.filter(
    (u) => u.membership?.status === "active" || u.membership?.status === "trialing"
  );
  const inactive = users.filter((u) => !active.includes(u));

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          People
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Members</h1>
      </header>

      <Section title={`Active (${active.length})`} users={active} showStatus />
      <Section title={`Other users (${inactive.length})`} users={inactive} />
    </div>
  );
}

function Section({
  title,
  users,
  showStatus,
}: {
  title: string;
  users: Awaited<ReturnType<typeof getUsers>>;
  showStatus?: boolean;
}) {
  if (users.length === 0) {
    return (
      <section>
        <h2 className="font-serif text-xl text-[var(--color-gold-soft)] mb-3">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-mist)]">None.</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="font-serif text-xl text-[var(--color-gold-soft)] mb-3">
        {title}
      </h2>
      <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
            <tr>
              <th className="text-left p-4">Name / Email</th>
              <th className="text-left p-4">Role</th>
              {showStatus && <th className="text-left p-4">Status</th>}
              {showStatus && <th className="text-left p-4">Renews</th>}
              <th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-veil)]/40">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  <p className="text-sm text-[var(--color-pearl)]">
                    {u.name ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--color-mist)]">{u.email}</p>
                </td>
                <td className="p-4 text-xs text-[var(--color-moon)]">{u.role}</td>
                {showStatus && (
                  <td className="p-4 text-xs text-[var(--color-gold-soft)] capitalize">
                    {u.membership?.status ?? "—"}
                    {u.membership?.cancelAtPeriodEnd && (
                      <span className="block text-[var(--color-mist)]">
                        cancels
                      </span>
                    )}
                  </td>
                )}
                {showStatus && (
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {u.membership?.currentPeriodEnd
                      ? formatDate(u.membership.currentPeriodEnd)
                      : "—"}
                  </td>
                )}
                <td className="p-4 text-xs text-[var(--color-moon)]">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// type helper
async function getUsers() {
  return prisma.user.findMany({ include: { membership: true } });
}
