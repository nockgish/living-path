import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSettings } from "./actions";

export const metadata = { title: "Admin · Settings" };

export default async function AdminSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Site
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Settings</h1>
      </header>

      <SettingsForm action={updateSettings} defaults={settings ?? undefined} />
    </div>
  );
}
