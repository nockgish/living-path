import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Purchases" };

export default async function PurchasesPage() {
  const user = await requireUser();

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Hydrate workshop titles
  const workshopIds = purchases
    .filter((p) => p.itemType === "workshop" && p.itemId)
    .map((p) => p.itemId!);
  const workshops = workshopIds.length
    ? await prisma.classEvent.findMany({ where: { id: { in: workshopIds } } })
    : [];
  const titleById = new Map(workshops.map((w) => [w.id, w.title]));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Receipts
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">Purchases</h1>
      </header>

      {purchases.length === 0 ? (
        <p className="text-sm text-[var(--color-mist)]">No purchases yet.</p>
      ) : (
        <div className="rounded-lg border border-[var(--color-veil)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-night-2)]/80 text-xs uppercase tracking-widest text-[var(--color-mist)]">
              <tr>
                <th className="text-left p-4">Item</th>
                <th className="text-left p-4">Date</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-veil)]/40">
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <p className="text-sm text-[var(--color-pearl)]">
                      {p.itemId ? titleById.get(p.itemId) ?? p.itemType : p.itemType}
                    </p>
                    <p className="text-xs text-[var(--color-mist)] capitalize">
                      {p.itemType}
                    </p>
                  </td>
                  <td className="p-4 text-sm text-[var(--color-moon)]">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="p-4 text-right font-serif text-[var(--color-gold)]">
                    {formatPrice(p.amount)}
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
