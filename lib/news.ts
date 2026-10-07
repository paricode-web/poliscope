import { sampleArticles } from "@/data/sample-articles";
import { categories } from "./site";
import type { Article, Category } from "./types";

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

const byNewest = (a: Article, b: Article) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/** این توابع async هستند تا جایگزینی با Prisma بدون تغییر در صفحه‌ها انجام شود. */
export async function getBreakingNews(limit = 5): Promise<Article[]> {
  return sampleArticles.filter((a) => a.isBreaking).sort(byNewest).slice(0, limit);
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const featured = sampleArticles
    .filter((a) => a.featuredRank !== undefined)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  const [lead = null, ...secondary] = featured;
  const rest = sampleArticles.filter((a) => a.featuredRank === undefined).sort(byNewest);

  return {
    lead,
    secondary,
    latest: rest.slice(0, 6),
    sections: categories
      .map((category) => ({
        category,
        articles: rest.filter((a) => a.category === category.slug).slice(0, 3),
      }))
      .filter((section) => section.articles.length > 0),
  };
}
