import { prisma } from "@/lib/db";
import { Hero } from "@/components/landing/Hero";
import { TeachingsSection } from "@/components/landing/TeachingsSection";
import { ClassesSection } from "@/components/landing/ClassesSection";
import { EssaysSection } from "@/components/landing/EssaysSection";
import { LineageSection } from "@/components/landing/LineageSection";
import { SubscribeSection } from "@/components/landing/SubscribeSection";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, classes, essays] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.classEvent.findMany({
      where: { published: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4,
    }),
    prisma.essay.findMany({
      where: { publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <Hero
        title={settings?.heroTitle ?? "Living Path"}
        subtitle={
          settings?.heroSubtitle ??
          "Himalayan Yoga · Spiritual Poetry · Nondual Teaching"
        }
        tagline={settings?.heroTagline ?? "Himalayan Yoga in the here and now"}
      />
      <TeachingsSection />
      <ClassesSection classes={classes} />
      <EssaysSection essays={essays} />
      <LineageSection
        body={
          settings?.lineageBody ??
          "The Living Path draws from the Himalayan tradition…"
        }
      />
      <SubscribeSection />
    </>
  );
}
