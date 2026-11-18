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

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const statusLabel = (status: string) => (status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس");

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  await requireAdmin();
  const { locale, slug } = await params;
  const dbLocale = locale === "en" ? Locale.EN : Locale.FA;

  // رکوردی که آدرس به آن اشاره می‌کند، فقط برای پیدا کردن کلید اتصال ترجمه‌ها.
  const current = await prisma.article.findFirst({
    where: { locale: dbLocale, slug: decode(slug) },
    select: { translationKey: true },
  });
  if (!current) notFound();

  const [versions, categories] = await Promise.all([
    prisma.article.findMany({
      where: { translationKey: current.translationKey },
      include: { category: { select: { slug: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const fa = versions.find((v) => v.locale === Locale.FA);
  const en = versions.find((v) => v.locale === Locale.EN);

  // فیلدهای مشترک از نسخهٔ فارسی خوانده می‌شوند؛ اگر فارسی نبود، از انگلیسی.
  const base = fa ?? en;
  if (!base) notFound();

  const d = base.publishedAt;
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
        <p className="mt-3 text-sm text-ink-2">
          نسخهٔ فارسی: {fa ? statusLabel(fa.status) : "ندارد (با ذخیره ساخته می‌شود)"} · نسخهٔ انگلیسی:{" "}
          {en ? statusLabel(en.status) : "ندارد (در صورت پر کردن، ساخته می‌شود)"}
        </p>
      </header>

      <ArticleForm
        locale={locale}
        categories={categories}
        translationKey={current.translationKey}
        originalSlug={fa?.slug}
        enOriginalSlug={en?.slug}
        values={{
          title: fa?.title ?? "",
          slug: fa?.slug ?? "",
          summary: fa?.summary ?? "",
          body: fa?.body ?? "",
          status: fa?.status ?? "PUBLISHED",
          imageAlt: fa?.imageAlt ?? "",
          type: base.type,
          categorySlug: base.category.slug,
          imageUrl: base.imageUrl ?? "",
          isBreaking: base.isBreaking,
          featuredRank: base.featuredRank?.toString() ?? "",
          publishedAt: localDate,
        }}
        enValues={
          en
            ? {
                title: en.title,
                slug: en.slug,
                summary: en.summary,
                body: en.body,
                status: en.status,
                imageAlt: en.imageAlt ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}