import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { createBroadcast } from "../actions";

export const metadata = { title: "Admin · New Broadcast" };

export default function NewBroadcastPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          New Broadcast
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Compose</h1>
      </header>
      <BroadcastForm action={createBroadcast} submitLabel="Create draft" />
    </div>
  );
}
