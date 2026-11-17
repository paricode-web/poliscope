import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  /** پارامترهای ثابت آدرس، مثل q در جستجو */
  query?: Record<string, string>;
}

const itemClass =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line px-3 text-sm font-medium transition-colors";

function pageWindow(current: number, total: number): Array<number | "gap"> {
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  return pages.flatMap<number | "gap">((page, i) => (i > 0 && page - pages[i - 1] > 1 ? ["gap", page] : [page]));
}

export function Pagination({ currentPage, totalPages, basePath, query }: PaginationProps) {
  const t = useTranslations("Pagination");
  const format = useFormatter();

  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams(query);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav aria-label={t("label")} className="flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} aria-label={t("previous")} className={cn(itemClass, "hover:bg-canvas-2")}>
          <ChevronLeft aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : (
        <span aria-hidden className={cn(itemClass, "opacity-40")}>
          <ChevronLeft className="size-4 rtl:-scale-x-100" />
        </span>
      )}

      {pageWindow(currentPage, totalPages).map((page, i) =>
        page === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-ink-2">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              itemClass,
              page === currentPage ? "border-accent-strong bg-accent-strong text-accent-ink" : "hover:bg-canvas-2",
            )}
          >
            {format.number(page)}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} aria-label={t("next")} className={cn(itemClass, "hover:bg-canvas-2")}>
          <ChevronRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : (
        <span aria-hidden className={cn(itemClass, "opacity-40")}>
          <ChevronRight className="size-4 rtl:-scale-x-100" />
        </span>
      )}
    </nav>
  );
}
