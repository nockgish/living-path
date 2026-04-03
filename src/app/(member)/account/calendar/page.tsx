import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { CancelRsvpButton } from "@/components/account/CancelRsvpButton";

export const metadata = { title: "My Calendar" };

export default async function MyCalendarPage() {
  const user = await requireUser();

  const rsvps = await prisma.rSVP.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { classEvent: true },
  });

  const now = new Date();
  const upcoming = rsvps.filter(
    (r) => (r.occurrence ?? r.classEvent.startsAt) >= now
  );
  const past = rsvps.filter(
    (r) => (r.occurrence ?? r.classEvent.startsAt) < now
  );

  return (
    <div className="space-y-12">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          My Calendar
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          Your RSVPs
        </h1>
      </header>

      <section>
        <h2 className="font-serif text-2xl text-[var(--color-gold-soft)] mb-4">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-mist)]">No upcoming RSVPs.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((r) => (
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
                  {r.classEvent.zoomUrl && (
                    <a
                      href={r.classEvent.zoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] mt-1 inline-block"
                    >
                      Join →
                    </a>
                  )}
                </div>
                <CancelRsvpButton
                  classEventId={r.classEventId}
                  occurrence={r.occurrence?.toISOString() ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl text-[var(--color-mist)] mb-4">Past</h2>
          <ul className="space-y-2">
            {past.slice(0, 10).map((r) => (
              <li
                key={r.id}
                className="rounded border border-[var(--color-veil)]/40 p-3 text-sm text-[var(--color-mist)]"
              >
                <span className="text-[var(--color-moon)]">{r.classEvent.title}</span>
                <span className="ml-3 text-xs">
                  {formatDateTime(r.occurrence ?? r.classEvent.startsAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
