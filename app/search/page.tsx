import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Search } from "lucide-react";
import { NewsCard } from "../components/news/NewsCard";
import { Pagination } from "../components/news/Pagination"; 
import { EmptyState } from "../components/ui/EmptyState"; 
import { SearchInput } from "../components/ui/SearchInput";
import { formatNumber } from "@/lib/format";
import { searchArticles } from "@/lib/news"; 
import { categories, categoryHref } from "@/lib/site";
import { pageSchema, searchQuerySchema } from "@/lib/validations/listing";

export const metadata: Metadata = { title: "جستجو", robots: { index: false } };

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = searchQuerySchema.parse(params.q);
  const page = pageSchema.parse(params.page);
  const results = query ? await searchArticles(query, page) : null;

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">جستجو</h1>
      <SearchInput id="page-search" defaultValue={query} size="lg" className="mt-8 max-w-2xl" />

      <div className="mt-10">
        {!results && (
          <EmptyState icon={Search} title="چه خبری را دنبال می‌کنید؟" description="عبارت مورد نظر را بنویسید یا از دسته‌بندی‌ها شروع کنید.">
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={categoryHref(c.slug)}
                    className="inline-flex h-9 items-center rounded-md border border-line px-4 text-sm font-medium hover:bg-canvas-2"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </EmptyState>
        )}

        {results && results.items.length === 0 && (
          <EmptyState icon={SearchX} title={`نتیجه‌ای برای «${query}» پیدا نشد`} description="املای عبارت را بررسی کنید یا کلمهٔ کوتاه‌تری امتحان کنید." />
        )}

        {results && results.items.length > 0 && (
          <>
            <p className="mb-6 text-ink-2">
              {formatNumber(results.total)} نتیجه برای «{query}»
            </p>
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
