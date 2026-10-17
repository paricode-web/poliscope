import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/app/components/news/NewsCard";
import { Pagination } from "@/app/components/news/Pagination"; 
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { formatNumber } from "@/lib/format"; 
import { getCategoryPage } from "@/lib/news";
import { categoryHref, findCategory, siteConfig } from "@/lib/site";
import { pageSchema } from "@/lib/validations/listing";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = findCategory((await params).slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `آخرین اخبار و تحلیل‌های ${category.name} در ${siteConfig.name}`,
    alternates: { canonical: categoryHref(category.slug) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = findCategory((await params).slug);
  if (!category) notFound();

  const page = pageSchema.parse((await searchParams).page);
  const { items, total, totalPages } = await getCategoryPage(category.slug, page);
  if (page > 1 && items.length === 0) notFound();

  return (
    <div className="container-page py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "صفحهٔ اصلی", href: "/" }, { label: category.name }]} />
      <header className="mb-10 mt-6 border-b border-line pb-6">
        <h1 className="border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">{category.name}</h1>
        <p className="mt-3 text-ink-2">{formatNumber(total)} خبر</p>
      </header>

      {items.length === 0 ? (
        <EmptyState icon={Newspaper} title="هنوز خبری در این دسته منتشر نشده است" />
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
