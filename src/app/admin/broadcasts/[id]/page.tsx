import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { BroadcastSendButton } from "@/components/admin/BroadcastSendButton";
import { updateBroadcast, deleteBroadcast } from "../actions";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Admin · Edit Broadcast" };

export default async function EditBroadcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const broadcast = await prisma.broadcast.findUnique({ where: { id } });
  if (!broadcast) notFound();

  const activeCount = await prisma.subscriber.count({
    where: { status: "active" },
  });

  const isSent = broadcast.status === "sent";
  const update = updateBroadcast.bind(null, broadcast.id);
  const remove = deleteBroadcast.bind(null, broadcast.id);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            {isSent ? "Sent broadcast" : "Edit draft"}
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
            {broadcast.subject}
          </h1>
          {isSent && broadcast.sentAt && (
            <p className="text-xs text-[var(--color-mist)] mt-2">
              Sent to {broadcast.sentCount} on {formatDateTime(broadcast.sentAt)}
            </p>
          )}
        </div>
      </header>

      <BroadcastForm
        defaults={{
          subject: broadcast.subject,
          bodyHtml: broadcast.bodyHtml,
          bodyText: broadcast.bodyText,
        }}
        action={update}
        submitLabel="Save changes"
        readOnly={isSent}
      />

      {!isSent && (
        <div className="flex items-center justify-between pt-6 border-t border-[var(--color-veil)]/40">
          <BroadcastSendButton id={broadcast.id} count={activeCount} />
          <form action={remove}>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest text-red-300 hover:text-red-200"
            >
              Delete draft
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
