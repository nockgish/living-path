import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { MessageRow } from "@/components/admin/MessageRow";

export const metadata = { title: "Admin · Messages" };

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Inbox
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            Contact Messages
          </h1>
        </div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-mist)]">
          {unread} unread
        </p>
      </header>

      {messages.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              id={m.id}
              name={m.name}
              email={m.email}
              message={m.message}
              read={m.read}
              createdAt={formatDateTime(m.createdAt)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
