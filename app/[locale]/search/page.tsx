import type { Metadata } from "next";
import { SearchX, Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCard } from "@/app/components/news/NewsCard";
import { Pagination } from "@/app/components/news/Pagination";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { SearchInput } from "@/app/components/ui/SearchInput";
import { Link } from "@/i18n/navigation";
import { searchArticles } from "@/lib/news";
import { categories, categoryHref } from "@/lib/site";
import { pageSchema, searchQuerySchema } from "@/lib/validations/listing";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}

export async function generateMetadata({ params }: Pick<SearchPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Search" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Search");
  const tCat = await getTranslations("Categories");

  const sp = await searchParams;
  const query = searchQuerySchema.parse(sp.q);
  const page = pageSchema.parse(sp.page);
  const results = query ? await searchArticles(query, page, locale) : null;

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">{t("title")}</h1>
      <SearchInput id="page-search" defaultValue={query} size="lg" className="mt-8 max-w-2xl" />

      <div className="mt-10">
        {!results && (
          <EmptyState icon={Search} title={t("promptTitle")} description={t("promptDescription")}>
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={categoryHref(c.slug)}
                    className="inline-flex h-9 items-center rounded-md border border-line px-4 text-sm font-medium hover:bg-canvas-2"
                  >
                    {tCat(c.slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </EmptyState>
        )}

        {results && results.items.length === 0 && (
          <EmptyState icon={SearchX} title={t("noResultsTitle", { query })} description={t("noResultsDescription")} />
        )}

        {results && results.items.length > 0 && (
          <>
            <p className="mb-6 text-ink-2">{t("resultCount", { count: results.total, query })}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
            <div className="mt-12">
              <Pagination currentPage={page} totalPages={results.totalPages} basePath="/search" query={{ q: query }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}