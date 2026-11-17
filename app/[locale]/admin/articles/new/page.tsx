import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArticleForm } from "@/app/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "محتوای جدید",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  const { type } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  const initialKind =
   type=== "ARTICLE" ||type=== "ANALYSIS" ||type=== "NEWS" ?type: "NEWS";

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-8 border-b border-line pb-6">
        <Link href={`/${locale}/admin/articles`} className="text-sm text-ink-2 hover:text-accent-strong">
          ← مدیریت محتوا
        </Link>
        <h1 className="mt-2 border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">
          محتوای جدید
        </h1>
      </header>

      <ArticleForm locale={locale} categories={categories} values={{ type: initialKind }} />
    </div>
  );
}