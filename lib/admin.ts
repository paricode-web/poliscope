import prisma from "@/lib/prisma";

export interface AdminArticleRow {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  isBreaking: boolean;
  publishedAt: string;
  status: "published" | "scheduled";
}

export async function getAdminOverview() {
  const now = new Date();

  const [published, scheduled, subscribers, rows] = await Promise.all([
    prisma.article.count({ where: { publishedAt: { lte: now } } }),
    prisma.article.count({ where: { publishedAt: { gt: now } } }),
    prisma.subscriber.count(),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        isBreaking: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const latest: AdminArticleRow[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryName: row.category.name,
    isBreaking: row.isBreaking,
    publishedAt: row.publishedAt.toISOString(),
    status: row.publishedAt <= now ? "published" : "scheduled",
  }));

  return { published, scheduled, subscribers, latest };
}