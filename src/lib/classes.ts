import { RRule, RRuleSet, rrulestr } from "rrule";
import type { ClassEvent } from "@prisma/client";

export interface ExpandedEvent {
  classEventId: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  isWorkshop: boolean;
  priceCents: number | null;
  capacity: number | null;
  location: string | null;
  zoomUrl: string | null;
  imageUrl: string | null;
  occurrenceKey: string; // unique key for occurrence (used for RSVP linkage)
  isRecurringInstance: boolean;
}

/**
 * Expand a list of ClassEvent rows into individual occurrences within a window.
 * Non-recurring events pass through; recurring events are expanded via RRULE.
 */
export function expandEvents(
  events: ClassEvent[],
  windowStart: Date,
  windowEnd: Date
): ExpandedEvent[] {
  const out: ExpandedEvent[] = [];

  for (const e of events) {
    if (!e.recurring) {
      if (e.startsAt < windowEnd && e.endsAt > windowStart) {
        out.push(toExpanded(e, e.startsAt, e.endsAt, false));
      }
      continue;
    }

    try {
      const durationMs = e.endsAt.getTime() - e.startsAt.getTime();
      const rule = rrulestr(`DTSTART:${formatICSDate(e.startsAt)}\nRRULE:${e.recurring}`);
      const occurrences = rule.between(windowStart, windowEnd, true);
      for (const start of occurrences) {
        const end = new Date(start.getTime() + durationMs);
        out.push(toExpanded(e, start, end, true));
      }
    } catch (err) {
      console.error("[classes] RRULE parse failed", e.id, err);
      // Fallback: treat as one-off
      if (e.startsAt < windowEnd && e.endsAt > windowStart) {
        out.push(toExpanded(e, e.startsAt, e.endsAt, false));
      }
    }
  }

  return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

function toExpanded(
  e: ClassEvent,
  startsAt: Date,
  endsAt: Date,
  isRecurringInstance: boolean
): ExpandedEvent {
  return {
    classEventId: e.id,
    title: e.title,
    description: e.description,
    startsAt,
    endsAt,
    isWorkshop: e.isWorkshop,
    priceCents: e.priceCents,
    capacity: e.capacity,
    location: e.location,
    zoomUrl: e.zoomUrl,
    imageUrl: e.imageUrl,
    occurrenceKey: `${e.id}__${startsAt.toISOString()}`,
    isRecurringInstance,
  };
}

function formatICSDate(d: Date) {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function parseOccurrenceKey(key: string): { eventId: string; date: Date } | null {
  const [eventId, iso] = key.split("__");
  if (!eventId || !iso) return null;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  return { eventId, date };
}
