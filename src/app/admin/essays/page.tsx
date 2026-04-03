import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { SubstackSyncButton } from "@/components/admin/SubstackSyncButton";

export const metadata = { title: "Admin · Essays" };

export default async function AdminEssays() {
  const essays = await prisma.essay.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Editorial
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Essays</h1>
        </div>
        <div className="flex gap-3">
          <SubstackSyncButton />
          <Button asChild>
            <Link href="/admin/essays/new">+ New essay</Link>
          </Button>
        </div>
      </header>

      {essays.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">No essays yet.</p>
      ) : (
        <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Updated</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-veil)]/40">
              {essays.map((e) => (
                <tr key={e.id}>
                  <td className="p-4">
                    <p className="text-sm text-[var(--color-pearl)]">{e.title}</p>
                    <p className="text-xs text-[var(--color-mist)]">/{e.slug}</p>
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)] capitalize">
                    {e.source}
                  </td>
                  <td className="p-4 text-xs">
                    {e.publishedAt ? (
                      <span className="text-[var(--color-gold-soft)]">Published</span>
                    ) : (
                      <span className="text-[var(--color-mist)]">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {formatDate(e.updatedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/essays/${e.id}`}
                      className="text-xs uppercase tracking-widest text-[var(--color-gold-soft)] hover:text-[var(--color-gold)]"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
