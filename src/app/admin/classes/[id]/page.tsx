import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClassForm } from "@/components/admin/ClassForm";
import { updateClass, deleteClass } from "../actions";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Admin · Edit Class" };

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.classEvent.findUnique({
    where: { id },
    include: {
      rsvps: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!event) notFound();

  const update = updateClass.bind(null, event.id);
  const remove = deleteClass.bind(null, event.id);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Edit Event
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          {event.title}
        </h1>
      </header>

      <ClassForm
        defaults={event}
        action={update}
        onDelete={remove}
        submitLabel="Save changes"
      />

      <section>
        <h2 className="font-serif text-xl text-[var(--color-gold-soft)] mb-3">
          RSVPs ({event.rsvps.length})
        </h2>
        {event.rsvps.length === 0 ? (
          <p className="text-sm text-[var(--color-mist)]">No RSVPs yet.</p>
        ) : (
          <ul className="space-y-2">
            {event.rsvps.map((r) => (
              <li
                key={r.id}
                className="rounded border border-[var(--color-veil)]/40 p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-[var(--color-pearl)]">
                    {r.user.name ?? r.user.email}
                  </p>
                  <p className="text-xs text-[var(--color-mist)]">
                    {r.user.email}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-moon)]">
                  {r.occurrence ? formatDateTime(r.occurrence) : "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
