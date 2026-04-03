import { headers } from "next/headers";
import { SiteNav } from "@/components/nav/SiteNav";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { prisma } from "@/lib/db";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  // Detect landing page from headers (Next 15 needs awaited headers)
  const h = await headers();
  const path = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "";
  const isLandingPage = path === "/" || path === "";

  return (
    <>
      <SiteNav isLandingPage={isLandingPage} />
      <main className="pt-16">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
