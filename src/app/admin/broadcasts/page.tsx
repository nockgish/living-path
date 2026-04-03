import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Admin · Broadcasts" };

export default async function AdminBroadcasts() {
  const broadcasts = await prisma.broadcast.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Newsletter
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            Broadcasts
          </h1>
        </div>
        <Button asChild>
          <Link href="/admin/broadcasts/new">+ Compose</Link>
        </Button>
      </header>

      {broadcasts.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">
          No broadcasts yet. Compose one to send to all active subscribers.
        </p>
      ) : (
        <ul className="space-y-3">
          {broadcasts.map((b) => (
            <li
              key={b.id}
              className="rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-4"
            >
              <Link
                href={`/admin/broadcasts/${b.id}`}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-[var(--color-pearl)]">{b.subject}</p>
                  <p className="text-xs text-[var(--color-mist)] mt-1">
                    {b.status === "sent"
                      ? `Sent to ${b.sentCount} on ${
                          b.sentAt ? formatDateTime(b.sentAt) : ""
                        }`
                      : `Draft · ${formatDateTime(b.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${
                    b.status === "sent"
                      ? "text-[var(--color-gold)] border border-[var(--color-gold)]/40"
                      : "text-[var(--color-mist)] border border-[var(--color-veil)]"
                  }`}
                >
                  {b.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
