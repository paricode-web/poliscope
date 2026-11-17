import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCard } from "@/app/components/news/NewsCard";
import { Pagination } from "@/app/components/news/Pagination";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { getCategoryPage } from "@/lib/news";
import { categoryHref, findCategory } from "@/lib/site";
import { pageSchema } from "@/lib/validations/listing";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};

  const t = await getTranslations({ locale, namespace: "Category" });
  const tCat = await getTranslations({ locale, namespace: "Categories" });
  const tSite = await getTranslations({ locale, namespace: "Site" });
  const name = tCat(category.slug);

  return {
    title: name,
    description: t("metaDescription", { category: name, site: tSite("name") }),
    alternates: { canonical: categoryHref(category.slug) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = findCategory(slug);
  if (!category) notFound();

  const t = await getTranslations("Category");
  const tCat = await getTranslations("Categories");
  const tNav = await getTranslations("Nav");

  const page = pageSchema.parse((await searchParams).page);
  const { items, total, totalPages } = await getCategoryPage(category.slug, page, locale);
  if (page > 1 && items.length === 0) notFound();

  const name = tCat(category.slug);

  return (
    <div className="container-page py-10 lg:py-14">
      <Breadcrumbs items={[{ label: tNav("home"), href: "/" }, { label: name }]} />
      <header className="mb-10 mt-6 border-b border-line pb-6">
        <h1 className="border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">{name}</h1>
        <p className="mt-3 text-ink-2">{t("count", { count: total })}</p>
      </header>

      {items.length === 0 ? (
        <EmptyState icon={Newspaper} title={t("empty")} />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} basePath={categoryHref(category.slug)} />
          </div>
        </>
      )}
    </div>
  );
}