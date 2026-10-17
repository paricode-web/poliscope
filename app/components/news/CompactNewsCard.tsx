import Link from "next/link";
import { CategoryBadge } from "../ui/CategoryBadge";
import { CoverImage } from "../ui/CoverImage";
import { cn } from "@/lib/cn";
import { articleHref } from "@/lib/site";
import type { Article } from "@/lib/types";
import { ArticleMeta } from "./ArticleMeta";

interface CompactNewsCardProps {
  article: Article;
  withImage?: boolean;
  showSummary?: boolean;
  showCategory?: boolean;
  className?: string;
}

export function CompactNewsCard({
  article,
  withImage = false,
  showSummary = false,
  showCategory = true,
  className,
}: CompactNewsCardProps) {
  const href = articleHref(article);
  return (
    <article className={cn("flex gap-4", className)}>
      {withImage && (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="w-28 shrink-0 sm:w-32">
          <CoverImage image={article.image} sizes="128px" className="aspect-square rounded-md" />
        </Link>
      )}
      <div className="min-w-0">
        {showCategory && <CategoryBadge slug={article.category} />}
        <h3 className="mt-1 text-base font-bold leading-7">
          <Link href={href} className="transition-colors hover:text-accent-strong">
            {article.title}
          </Link>
        </h3>
        {showSummary && <p className="mt-1 line-clamp-2 text-sm text-ink-2">{article.summary}</p>}
        <ArticleMeta article={article} showReadTime={false} className="mt-2" />
      </div>
    </article>
  );
}
