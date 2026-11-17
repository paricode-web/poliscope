import type { Metadata } from "next";
import Link from "next/link";
import { Locale, type ArticleType, type Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "مدیریت محتوا",
  robots: { index: false, follow: false },
};

const TYPES: Record<ArticleType, string> = {
  NEWS: "خبر",
  ARTICLE: "مقاله",
  ANALYSIS: "تحلیل",
  NOTE: "یادداشت",
  BOOK_REVIEW: "نقد کتاب",
  INTERVIEW: "گفتگو",
};
const isType = (v?: string): v is ArticleType => !!v && v in TYPES;

const badge: Record<ArticleType, string> = {
  NEWS: "bg-canvas-2 text-ink-2",
  ARTICLE: "border border-line text-ink",
  ANALYSIS: "bg-accent-soft text-ink",
  NOTE: "border border-line text-ink-2",
  BOOK_REVIEW: "border border-line text-ink",
  INTERVIEW: "bg-canvas-2 text-ink",
};

export default async function AdminArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; q?: string; saved?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  const { type, q, saved, deleted } = await searchParams;

  const dbLocale = locale === "en" ? Locale.EN : Locale.FA;
  const activeType = isType(type) ? type : undefined;
  const query = q?.trim();

  const where: Prisma.ArticleWhereInput = {
    locale: dbLocale,
    ...(activeType ? { type: activeType } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, grouped] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 100,
      include: { category: { select: { name: true } } },
    }),
    prisma.article.groupBy({
      by: ["type"],
      where: { locale: dbLocale },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.type, g._count._all]));
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  const now = Date.now();

  const tabs: { key?: ArticleType; label: string; count: number }[] = [
    { label: "همه", count: total },
    ...(Object.keys(TYPES) as ArticleType[]).map((k) => ({
      key: k,
      label: TYPES[k],
      count: counts[k] ?? 0,
    })),
  ];

  const base = `/${locale}/admin/articles`;
  const newHref = `${base}/new${activeType ? `?type=${activeType}` : ""}`;

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link href={`/${locale}/admin`} className="text-sm text-ink-2 hover:text-accent-strong">
            ← پنل مدیریت
          </Link>
          <h1 className="mt-2 border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">
            مدیریت محتوا
          </h1>
        </div>
        <Link
          href={newHref}
          className="rounded-md bg-accent-strong px-5 py-2.5 font-bold text-accent-ink transition hover:opacity-90"
        >
          + {activeType ? `${TYPES[activeType]} جدید` : "محتوای جدید"}
        </Link>
      </header>

      {(saved || deleted) && (
        <p role="status" className="mb-6 rounded-lg border border-line bg-accent-soft px-4 py-3 font-bold">
          {saved ? "تغییرات ذخیره شد." : "مورد حذف شد."}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="نوع محتوا" className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = t.key === activeType;
            return (
              <Link
                key={t.label}
                href={t.key ? `${base}?type=${t.key}` : base}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                  active
                    ? "border-accent-strong bg-accent-strong text-accent-ink"
                    : "border-line hover:border-accent"
                }`}
              >
                {t.label}
                <span className="ms-2 opacity-70">{t.count.toLocaleString("fa-IR")}</span>
              </Link>
            );
          })}
        </nav>

        <form className="flex gap-2" role="search">
          <input type="hidden" name="type" value={activeType ?? ""} />
          <input
            name="q"
            defaultValue={query}
            placeholder="جست‌وجو در عنوان و خلاصه…"
            aria-label="جست‌وجو"
            className="w-64 rounded-md border border-line bg-canvas px-3.5 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
          <button className="rounded-md border border-line px-4 py-2 text-sm font-bold hover:border-accent">
            جست‌وجو
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-16 text-center">
          <p className="text-ink-2">موردی پیدا نشد.</p>
          <Link href={newHref} className="mt-4 inline-block font-bold text-accent-strong hover:underline">
            اولین مورد را بسازید
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[820px] text-start text-sm">
            <caption className="sr-only">فهرست محتوا</caption>
            <thead className="border-b border-line bg-canvas-2 text-ink-2">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-medium">محتوا</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">نوع</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">دسته</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">زمان</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => {
                const isDraft = item.status === "DRAFT";
                const scheduled = !isDraft && item.publishedAt.getTime() > now;
                const editHref = `${base}/${encodeURIComponent(item.slug)}/edit`;
                return (
                  <tr key={item.id} className="transition hover:bg-canvas-2/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-14 shrink-0 rounded bg-canvas-2" aria-hidden />
                        )}
                        <div className="min-w-0">
                          <Link href={editHref} className="line-clamp-1 font-bold hover:text-accent-strong">
                            {item.title}
                          </Link>
                          {item.isBreaking && (
                            <span className="rounded-sm bg-accent-soft px-2 py-0.5 text-caption font-bold">
                              فوری
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-caption font-bold ${badge[item.type]}`}>
                        {TYPES[item.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{item.category.name}</td>
                    <td className="px-4 py-3">
                      <span className={isDraft || scheduled ? "font-bold text-accent-strong" : "text-ink-2"}>
                        {isDraft ? "پیش‌نویس" : scheduled ? "زمان‌بندی‌شده" : "منتشرشده"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      <time dateTime={item.publishedAt.toISOString()}>
                        {formatDateTime(item.publishedAt.toISOString())}
                      </time>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={editHref} className="rounded-md px-2.5 py-1.5 text-sm font-medium transition hover:bg-canvas-2">
                          ویرایش
                        </Link>
                        <DeleteButton slug={item.slug} title={item.title} locale={locale} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}