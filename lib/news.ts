import { cache } from "react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { categories } from "./site";
import type { Article, ArticleDetail, Category, CategorySlug } from "./types";

export const PAGE_SIZE = 12;

export interface CategoryFeed {
  category: Category;
  articles: Article[];
}

export interface HomeFeed {
  lead: Article | null;
  secondary: Article[];
  latest: Article[];
  sections: CategoryFeed[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  totalPages: number;
}

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  imageUrl: true,
  imageAlt: true,
  readMinutes: true,
  isBreaking: true,
  featuredRank: true,
  publishedAt: true,
  category: { select: { slug: true } },
} satisfies Prisma.ArticleSelect;

type ArticleRow = Prisma.ArticleGetPayload<{ select: typeof articleSelect }>;

const isPublished = (): Prisma.ArticleWhereInput => ({ publishedAt: { lte: new Date() } });
const newestFirst = { publishedAt: "desc" } as const;

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category.slug as CategorySlug,
    publishedAt: row.publishedAt.toISOString(),
    readMinutes: row.readMinutes,
    isBreaking: row.isBreaking,
    featuredRank: row.featuredRank ?? undefined,
    image: row.imageUrl ? { src: row.imageUrl, alt: row.imageAlt ?? row.title } : undefined,
  };
}

async function findPage(where: Prisma.ArticleWhereInput, page: number): Promise<Paginated<Article>> {
  const [total, rows] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: newestFirst,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: articleSelect,
    }),
  ]);
  return { items: rows.map(toArticle), total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getBreakingNews(limit = 5): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { ...isPublished(), isBreaking: true },
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });
  return rows.map(toArticle);
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const unfeatured: Prisma.ArticleWhereInput = { ...isPublished(), featuredRank: null };

  const [featuredRows, latestRows, sectionRows] = await Promise.all([
    prisma.article.findMany({
      where: { ...isPublished(), featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      take: 4,
      select: articleSelect,
    }),
    prisma.article.findMany({ where: unfeatured, orderBy: newestFirst, take: 6, select: articleSelect }),
    Promise.all(
      categories.map((category) =>
        prisma.article.findMany({
          where: { ...unfeatured, category: { slug: category.slug } },
          orderBy: newestFirst,
          take: 3,
          select: articleSelect,
        }),
      ),
    ),
  ]);

  const [lead = null, ...secondary] = featuredRows.map(toArticle);
  return {
    lead,
    secondary,
    latest: latestRows.map(toArticle),
    sections: categories
      .map((category, i) => ({ category, articles: sectionRows[i].map(toArticle) }))
      .filter((section) => section.articles.length > 0),
  };
}

export function getCategoryPage(slug: CategorySlug, page: number) {
  return findPage({ ...isPublished(), category: { slug } }, page);
}

export function searchArticles(query: string, page: number) {
  return findPage(
    {
      ...isPublished(),
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    },
    page,
  );
}

/** با cache از React، فراخوانی تکراری در generateMetadata و صفحه فقط یک کوئری می‌زند. */
export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetail | null> => {
  const row = await prisma.article.findFirst({
    where: { slug, ...isPublished() },
    select: { ...articleSelect, body: true, updatedAt: true },
  });
  if (!row) return null;
  return { ...toArticle(row), body: row.body, updatedAt: row.updatedAt.toISOString() };
});

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { ...isPublished(), category: { slug: article.category }, id: { not: article.id } },
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });                                                                                                                                                                                                                                                                                                                                                             
  return rows.map(toArticle);
}

export async function getLatestForFeed(limit = 30): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: isPublished(),
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });
  return rows.map(toArticle);
}

export function getSitemapArticles() {
  return prisma.article.findMany({
    where: isPublished(),
    orderBy: newestFirst,
    select: { slug: true, updatedAt: true },
  });
}
