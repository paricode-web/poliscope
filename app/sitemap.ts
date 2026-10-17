import type { MetadataRoute } from "next";
import { infoSlugs } from "@/lib/info-pages";
import { getSitemapArticles } from "@/lib/news";
import { absoluteUrl, articleHref, categories, categoryHref } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getSitemapArticles();

  return [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    ...categories.map((c) => ({
      url: absoluteUrl(categoryHref(c.slug)),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...infoSlugs.map((slug) => ({
      url: absoluteUrl(`/${slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(articleHref(a)),
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
