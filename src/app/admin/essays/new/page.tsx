import { EssayForm } from "@/components/admin/EssayForm";
import { createEssay } from "../actions";

export const metadata = { title: "Admin · New Essay" };

export default function NewEssayPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          New Essay
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          Compose
        </h1>
      </header>
      <EssayForm action={createEssay} submitLabel="Create essay" />
    </div>
  );
}
