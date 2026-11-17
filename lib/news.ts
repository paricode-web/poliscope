import { cache } from "react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { categories } from "./site";
import type { Article, ArticleDetail, Category, CategorySlug } from "./types";

export const PAGE_SIZE = 12;
export const LATEST_PAGE_SIZE = 6;

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

/** نوع enum ستون locale در Prisma (مقدارهایش "FA" و "EN" است). */
type DbLocale = NonNullable<Prisma.ArticleWhereInput["locale"]> extends infer T
  ? Extract<T, string>
  : never;

/** تبدیل locale آدرس (fa / en) به مقدار enum در دیتابیس. */
const toDbLocale = (locale: string) => (locale === "en" ? "EN" : "FA") as DbLocale;

/** فقط خبرهای منتشرشده‌ی همان زبان. هر زبان ردیف جداگانه‌ی خودش را دارد (با translationKey مشترک). */
const published = (locale: string): Prisma.ArticleWhereInput => ({
  locale: toDbLocale(locale),
  publishedAt: { lte: new Date() },
});
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

export async function getBreakingNews(locale: string, limit = 5): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { ...published(locale), isBreaking: true },
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });
  return rows.map(toArticle);
}

export async function getHomeFeed(locale: string): Promise<HomeFeed> {
  const unfeatured: Prisma.ArticleWhereInput = { ...published(locale), featuredRank: null };

  const [featuredRows, latestRows, sectionRows] = await Promise.all([
    prisma.article.findMany({
      where: { ...published(locale), featuredRank: { not: null } },
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

export function getCategoryPage(slug: CategorySlug, page: number, locale: string) {
  return findPage({ ...published(locale), category: { slug } }, page);
}

export function searchArticles(query: string, page: number, locale: string) {
  return findPage(
    {
      ...published(locale),
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
export const getArticleBySlug = cache(async (slug: string, locale: string): Promise<ArticleDetail | null> => {
  const row = await prisma.article.findFirst({
    where: { slug, ...published(locale) },
    select: { ...articleSelect, body: true, updatedAt: true },
  });
  if (!row) return null;
  return { ...toArticle(row), body: row.body, updatedAt: row.updatedAt.toISOString() };
});

export async function getRelatedArticles(article: Article, locale: string, limit = 3): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { ...published(locale), category: { slug: article.category }, id: { not: article.id } },
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });
  return rows.map(toArticle);
}

export async function getLatestForFeed(locale: string, limit = 30): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: published(locale),
    orderBy: newestFirst,
    take: limit,
    select: articleSelect,
  });
  return rows.map(toArticle);
}

/** برش صفحه‌بندی‌شده‌ی آخرین اخبار؛ asOf لحظه‌ی مرجع است تا انتشار خبر جدید، offset را جابه‌جا نکند. */
export async function getLatestSlice(
  locale: string,
  offset: number,
  limit: number = LATEST_PAGE_SIZE,
  asOf: Date = new Date(),
): Promise<{ items: Article[]; hasMore: boolean }> {
  const rows = await prisma.article.findMany({
    where: { locale: toDbLocale(locale), publishedAt: { lte: asOf }, featuredRank: null },
    orderBy: newestFirst,
    skip: offset,
    take: limit + 1,
    select: articleSelect,
  });
  return {
    items: rows.slice(0, limit).map(toArticle),
    hasMore: rows.length > limit,
  };
}

/** برای سایت‌مپ: locale هم برمی‌گردد تا آدرس هر زبان جدا ساخته شود. */
export function getSitemapArticles() {
  return prisma.article.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: newestFirst,
    select: { slug: true, locale: true, translationKey: true, updatedAt: true },
  });
}
