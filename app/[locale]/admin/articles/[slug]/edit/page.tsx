import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Locale } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ArticleForm } from "@/app/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "ویرایش محتوا",
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  await requireAdmin();
  const { locale, slug } = await params;
  const dbLocale = locale === "en" ? Locale.EN : Locale.FA;

  const [article, categories] = await Promise.all([
    prisma.article.findFirst({
      where: { locale: dbLocale, slug: decodeURIComponent(slug) },
      include: { category: { select: { slug: true } } },
    }), 
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  if (!article) notFound();

  const d = article.publishedAt;
  const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-8 border-b border-line pb-6">
        <Link href={`/${locale}/admin/articles`} className="text-sm text-ink-2 hover:text-accent-strong">
          ← مدیریت محتوا
        </Link>
        <h1 className="mt-2 border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">
          ویرایش
        </h1>
      </header>

      <ArticleForm
        locale={locale}
        categories={categories}
        originalSlug={article.slug}
        values={{
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          body: article.body,
          type: article.type,
          status: article.status,
          categorySlug: article.category.slug,
          imageUrl: article.imageUrl ?? "",
          imageAlt: article.imageAlt ?? "",
          isBreaking: article.isBreaking,
          featuredRank: article.featuredRank?.toString() ?? "",
          publishedAt: localDate,
        }}
      />
    </div>
  );
}