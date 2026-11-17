import { Clock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { Article } from "@/lib/types";

interface ArticleMetaProps {
  article: Pick<Article, "publishedAt" | "readMinutes">;
  showReadTime?: boolean;
  className?: string;
}

export function ArticleMeta({ article, showReadTime = true, className }: ArticleMetaProps) {
  const t = useTranslations("Home");
  const format = useFormatter();

  return (
    <p className={cn("flex items-center gap-4 text-sm text-ink-2", className)}>
      <span className="inline-flex items-center gap-1.5">
        <Clock aria-hidden className="size-4" />
        <time dateTime={article.publishedAt}>{format.relativeTime(new Date(article.publishedAt))}</time>
      </span>
      {showReadTime && <span>{t("readingTime", { minutes: article.readMinutes })}</span>}
    </p>
  );
}
