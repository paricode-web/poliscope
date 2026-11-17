import prisma from "@/lib/prisma";

export async function getCategoryNames(locale: string) {
  const rows = await prisma.category.findMany({
    select: { slug: true, name: true, nameEn: true },
  });

  return Object.fromEntries(
    rows.map((c) => [c.slug, locale === "en" ? c.nameEn || c.name : c.name]),
  ) as Record<string, string>;
}