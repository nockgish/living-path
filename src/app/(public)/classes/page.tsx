import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { expandEvents } from "@/lib/classes";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { RsvpButton } from "@/components/calendar/RsvpButton";
import { BuyWorkshopButton } from "@/components/calendar/BuyWorkshopButton";

export const metadata = { title: "Calendar" };
export const revalidate = 60;

export default async function ClassesPage() {
  const session = await auth();
  const isMember = !!session?.user;

  const now = new Date();
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + 3);

  const events = await prisma.classEvent.findMany({
    where: { published: true },
  });
  const expanded = expandEvents(events, now, windowEnd);

  // Group by month
  const byMonth = new Map<string, typeof expanded>();
  for (const e of expanded) {
    const monthKey = `${e.startsAt.getFullYear()}-${e.startsAt.getMonth()}`;
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
    byMonth.get(monthKey)!.push(e);
  }

  // User's existing RSVPs (by occurrenceKey if member)
  const existingRsvps = isMember
    ? await prisma.rSVP.findMany({
        where: { userId: session!.user.id },
        select: { classEventId: true, occurrence: true },
      })
    : [];
  const rsvpKeys = new Set(
    existingRsvps.map(
      (r) => `${r.classEventId}__${r.occurrence?.toISOString() ?? ""}`
    )
  );

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-4">
          Calendar
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-pearl)] font-light">
          Classes & Workshops
        </h1>
      </header>

      {expanded.length === 0 ? (
        <p className="text-center text-[var(--color-mist)]">
          No upcoming sessions on the books.
        </p>
      ) : (
        <div className="space-y-12">
          {[...byMonth.entries()].map(([key, items]) => {
            const sample = items[0].startsAt;
            const monthLabel = new Intl.DateTimeFormat("en-US", {
              month: "long",
              year: "numeric",
            }).format(sample);
            return (
              <section key={key}>
                <h2 className="font-serif text-2xl text-[var(--color-gold-soft)] mb-6 border-b border-[var(--color-veil)]/40 pb-3">
                  {monthLabel}
                </h2>
                <div className="space-y-4">
                  {items.map((e) => {
                    const occKey = e.isRecurringInstance
                      ? `${e.classEventId}__${e.startsAt.toISOString()}`
                      : `${e.classEventId}__`;
                    const hasRsvp = rsvpKeys.has(occKey);
                    return (
                      <article
                        key={e.occurrenceKey}
                        className="rounded-lg border border-[var(--color-veil)] bg-[var(--color-night-2)]/60 p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="font-serif text-xl text-[var(--color-pearl)]">
                                {e.title}
                              </h3>
                              {e.isWorkshop && (
                                <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-2 py-0.5 rounded">
                                  Workshop
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--color-moon)] mb-3 whitespace-pre-line line-clamp-3">
                              {e.description}
                            </p>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-mist)]">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateTime(e.startsAt)}
                              </span>
                              {e.isRecurringInstance && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  Recurring
                                </span>
                              )}
                              {e.location && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {e.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {e.isWorkshop && e.priceCents != null ? (
                              <div className="text-right">
                                <p className="text-sm text-[var(--color-gold)] mb-2 font-semibold">
                                  {formatPrice(e.priceCents)}
                                </p>
                                <BuyWorkshopButton classEventId={e.classEventId} />
                              </div>
                            ) : isMember ? (
                              <RsvpButton
                                classEventId={e.classEventId}
                                occurrence={
                                  e.isRecurringInstance ? e.startsAt.toISOString() : null
                                }
                                hasRsvp={hasRsvp}
                              />
                            ) : (
                              <Link
                                href="/sign-in?callbackUrl=/classes"
                                className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
                              >
                                Sign in to RSVP →
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
