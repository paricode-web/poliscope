import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOverview } from "@/lib/admin";
import { formatDateTime, formatNumber } from "@/lib/format";
import { requireAdmin } from "@/lib/require-admin";
import { articleHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  const { published, scheduled, subscribers, latest } = await getAdminOverview();

  const stats = [
    { label: "خبرهای منتشرشده", value: published },
    { label: "خبرهای زمان‌بندی‌شده", value: scheduled },
    { label: "مشترکان خبرنامه", value: subscribers },
  ];

  const base = `/${locale}/admin/articles`;

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="border-s-4 border-accent ps-4 text-h3 font-extrabold md:text-h2">
            پنل مدیریت
          </h1>
          <p className="mt-3 text-ink-2">خوش آمدید، {session.user?.name ?? "ادمین"}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`${base}/new?type=NEWS`}
            className="rounded-md bg-accent-strong px-4 py-2.5 text-sm font-bold text-accent-ink transition hover:opacity-90"
          >
            + خبر
          </Link>
          <Link
            href={`${base}/new?type=ARTICLE`}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-bold transition hover:border-accent"
          >
            + مقاله
          </Link>
          <Link
            href={`${base}/new?type=ANALYSIS`}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-bold transition hover:border-accent"
          >
            + تحلیل
          </Link>
        </div>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-line bg-surface p-6">
            <dt className="text-sm text-ink-2">{stat.label}</dt>
            <dd className="mt-2 text-h3 font-extrabold">{formatNumber(stat.value)}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="latest-articles" className="mt-14">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="latest-articles" className="text-h4 font-extrabold">
            آخرین خبرها
          </h2>
          <Link href={base} className="text-sm font-bold text-accent-strong hover:underline underline-offset-4">
            مدیریت همهٔ محتوا ←
          </Link>
        </div>

        {latest.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-12 text-center">
            <p className="text-ink-2">هنوز خبری ثبت نشده است.</p>
            <Link
              href={`${base}/new`}
              className="mt-4 inline-block font-bold text-accent-strong hover:underline underline-offset-4"
            >
              اولین خبر را بسازید
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[640px] text-start text-sm">
              <caption className="sr-only">فهرست آخرین خبرها</caption>
              <thead className="border-b border-line bg-canvas-2 text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-medium">عنوان</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">دسته</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">زمان انتشار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {latest.map((article) => (
                  <tr key={article.id}>
                    <td className="px-4 py-3 font-medium">
                      {article.status === "published" ? (
                        <Link
                          href={articleHref(article)}
                          className="hover:text-accent-strong hover:underline underline-offset-4"
                        >
                          {article.title}
                        </Link>
                      ) : (
                        article.title
                      )}
                      {article.isBreaking && (
                        <span className="ms-2 rounded-sm bg-accent-soft px-2 py-0.5 text-caption font-bold text-ink">
                          فوری
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-2">{article.categoryName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          article.status === "published"
                            ? "text-ink-2"
                            : "font-bold text-accent-strong"
                        }
                      >
                        {article.status === "published" ? "منتشرشده" : "زمان‌بندی‌شده"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      <time dateTime={article.publishedAt}>
                        {formatDateTime(article.publishedAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}