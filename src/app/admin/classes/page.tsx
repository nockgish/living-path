import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin · Calendar" };

export default async function AdminClasses() {
  const events = await prisma.classEvent.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { rsvps: true } } },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);
  const past = events.filter((e) => e.startsAt < now);

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Calendar
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            Classes & Workshops
          </h1>
        </div>
        <Button asChild>
          <Link href="/admin/classes/new">+ New event</Link>
        </Button>
      </header>

      <Section title={`Upcoming (${upcoming.length})`} events={upcoming} />
      <Section title={`Past (${past.length})`} events={past} />
    </div>
  );
}

function Section({
  title,
  events,
}: {
  title: string;
  events: Array<{
    id: string;
    title: string;
    startsAt: Date;
    isWorkshop: boolean;
    priceCents: number | null;
    recurring: string | null;
    published: boolean;
    _count: { rsvps: number };
  }>;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-[var(--color-gold-soft)] mb-3">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">None.</p>
      ) : (
        <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">When</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">RSVPs</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-veil)]/40">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="p-4">
                    <p className="text-sm text-[var(--color-pearl)]">{e.title}</p>
                    {!e.published && (
                      <p className="text-[10px] uppercase tracking-widest text-[var(--color-mist)] mt-1">
                        Unpublished
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {formatDateTime(e.startsAt)}
                    {e.recurring && (
                      <span className="block text-[var(--color-gold-soft)]">
                        recurring
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {e.isWorkshop ? (
                      <span className="text-[var(--color-gold)]">
                        Workshop · {e.priceCents ? formatPrice(e.priceCents) : "—"}
                      </span>
                    ) : (
                      "Class"
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {e._count.rsvps}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/classes/${e.id}`}
                      className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
