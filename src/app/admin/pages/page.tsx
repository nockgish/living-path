import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin · Pages" };

export default async function AdminPages() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
            Page Builder
          </p>
          <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Pages</h1>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">+ New page</Link>
        </Button>
      </header>

      {pages.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">No pages yet.</p>
      ) : (
        <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Updated</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-veil)]/40">
              {pages.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 text-sm text-[var(--color-pearl)]">{p.title}</td>
                  <td className="p-4 text-xs text-[var(--color-mist)]">/{p.slug}</td>
                  <td className="p-4 text-xs">
                    {p.status === "published" ? (
                      <span className="text-[var(--color-gold-soft)]">Published</span>
                    ) : (
                      <span className="text-[var(--color-mist)]">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--color-moon)]">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/pages/${p.id}`}
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
