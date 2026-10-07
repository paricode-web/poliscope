import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { Article } from "@/lib/types";

interface ArticleMetaProps {
  article: Pick<Article, "publishedAt" | "readMinutes">;
  showReadTime?: boolean;
  className?: string;
}

export function ArticleMeta({ article, showReadTime = true, className }: ArticleMetaProps) {
  return (
    <p className={cn("flex items-center gap-4 text-sm text-ink-2", className)}>
      <span className="inline-flex items-center gap-1.5">
        <Clock aria-hidden className="size-4" />
        <time dateTime={article.publishedAt}>{formatRelativeTime(article.publishedAt)}</time>
      </span>
      {showReadTime && <span>{formatNumber(article.readMinutes)} دقیقه مطالعه</span>}
    </p>
  );
}
