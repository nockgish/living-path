import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin · Subscribers" };

export default async function AdminSubscribers() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  const active = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Newsletter
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            Subscribers
          </h1>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl text-[var(--color-gold)]">{active}</p>
          <p className="text-xs uppercase tracking-widest text-[var(--color-mist)]">
            Active
          </p>
        </div>
      </header>

      {subscribers.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">No subscribers yet.</p>
      ) : (
        <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-veil)]/40">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 text-sm text-[var(--color-pearl)]">
                    {s.email}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {s.name ?? "—"}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {s.source ?? "—"}
                  </td>
                  <td className="p-4 text-xs">
                    {s.status === "active" ? (
                      <span className="text-[var(--color-gold-soft)]">Active</span>
                    ) : (
                      <span className="text-[var(--color-mist)] capitalize">
                        {s.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {formatDate(s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
