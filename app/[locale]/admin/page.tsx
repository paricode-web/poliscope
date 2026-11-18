import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleBody } from "@/app/components/news/ArticleBody";
import { NewsCard } from "@/app/components/news/NewsCard";
import { JsonLd } from "@/app/components/seo/JsonLd";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { CategoryBadge } from "@/app/components/ui/CategoryBadge";
import { CoverImage } from "@/app/components/ui/CoverImage";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { getPathname } from "@/i18n/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/news";
import { absoluteUrl, articleHref, categoryHref } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: getPathname({ href: articleHref(article), locale }) },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: article.image ? [{ url: article.image.src, alt: article.image.alt }] : undefined,
    },
    twitter: { card: article.image ? "summary_large_image" : "summary" },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const t = await getTranslations("Article");
  const tNav = await getTranslations("Nav");
  const tCat = await getTranslations("Categories");
  const tSite = await getTranslations("Site");
  const format = await getFormatter();

  const categoryName = tCat(article.category);
  const related = await getRelatedArticles(article, locale);
  const siteName = tSite("name");

  return (
    <div className="container-page py-10 lg:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.summary,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          inLanguage: locale,
          mainEntityOfPage: absoluteUrl(getPathname({ href: articleHref(article), locale })),
          image: article.image ? [article.image.src] : undefined,
          author: { "@type": "Organization", name: siteName },
          publisher: { "@type": "Organization", name: siteName },
        }}
      />

      <article>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: categoryName, href: categoryHref(article.category) },
              { label: article.title },
            ]}
          />
          <header className="mt-8">
            <CategoryBadge slug={article.category} />
            <h1 className="mt-3 text-h3 font-extrabold md:text-h2 lg:text-h1">{article.title}</h1>
            <p className="mt-5 text-xl text-ink-2">{article.summary}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 border-y border-line py-3 text-sm text-ink-2">
              <time dateTime={article.publishedAt}>
                {format.dateTime(new Date(article.publishedAt), { dateStyle: "long", timeStyle: "short" })}
              </time>
             <span>{t("readMinutes", { count: article.readMinutes })}</span>
            </p>
          </header>
        </div>

        {article.image && (
          <div className="mx-auto mt-8 max-w-5xl">
            <CoverImage
              image={article.image}
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="aspect-[16/9] rounded-lg"
            />
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl">
          <ArticleBody body={article.body} />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 lg:mt-28">
          <SectionHeader id="related-heading" title={t("related")} href={categoryHref(article.category)} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
