import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { infoSlugs } from "@/lib/info-pages";
import { getSitemapArticles } from "@/lib/news";
import { absoluteUrl, articleHref, categories, categoryHref } from "@/lib/site";

export const revalidate = 3600;

type Loc = (typeof routing.locales)[number];
type Entry = MetadataRoute.Sitemap[number];

const urlFor = (href: string, locale: Loc) => absoluteUrl(getPathname({ href, locale }));

/** یک صفحهٔ ثابت (که در هر دو زبان وجود دارد): یک ورودی برای هر زبان، با hreflang به بقیه. */
function localized(href: string, extra: Pick<Entry, "changeFrequency" | "priority">): Entry[] {
  const languages = Object.fromEntries(routing.locales.map((locale) => [locale, urlFor(href, locale)]));
  return routing.locales.map((locale) => ({
    url: languages[locale],
    ...extra,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getSitemapArticles();

  // آدرس هر زبانِ هر خبر، با گروه‌بندی بر اساس translationKey.
  const urlsByKey = new Map<string, Partial<Record<Loc, string>>>();
  for (const article of articles) {
    const locale: Loc = article.locale === "EN" ? "en" : "fa";
    const urls = urlsByKey.get(article.translationKey) ?? {};
    urls[locale] = urlFor(articleHref(article), locale);
    urlsByKey.set(article.translationKey, urls);
  }

  const articleEntries: Entry[] = articles.map((article) => {
    const locale: Loc = article.locale === "EN" ? "en" : "fa";
    const urls = urlsByKey.get(article.translationKey) ?? {};
    const hasTranslation = Object.keys(urls).length > 1;

    return {
      url: urls[locale] ?? urlFor(articleHref(article), locale),
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
      ...(hasTranslation ? { alternates: { languages: urls as Record<string, string> } } : {}),
    };
  });

  return [
    ...localized("/", { changeFrequency: "hourly", priority: 1 }),
    ...categories.flatMap((c) => localized(categoryHref(c.slug), { changeFrequency: "hourly", priority: 0.8 })),
    ...infoSlugs.flatMap((slug) => localized(`/${slug}`, { changeFrequency: "yearly", priority: 0.3 })),
    ...articleEntries,
  ];
}