import { ClassForm } from "@/components/admin/ClassForm";
import { createClass } from "../actions";

export const metadata = { title: "Admin · New Class" };

export default function NewClassPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          New Event
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          Class or Workshop
        </h1>
      </header>
      <ClassForm action={createClass} submitLabel="Create event" />
    </div>
  );
}
