import { Link } from "@/i18n/navigation";
import { CategoryBadge } from "../ui/CategoryBadge";
import { CoverImage } from "../ui/CoverImage";
import { articleHref } from "@/lib/site";
import type { Article } from "@/lib/types";
import { ArticleMeta } from "./ArticleMeta";

export function NewsCard({ article }: { article: Article }) {
  const href = articleHref(article);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <CoverImage
          image={article.image}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/2]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <CategoryBadge slug={article.category} />
        <h3 className="text-lg font-bold leading-8">
          <Link href={href} className="transition-colors hover:text-accent-strong">
            {article.title}
          </Link>
        </h3>
        <ArticleMeta article={article} showReadTime={false} className="mt-auto" />
      </div>
    </article>
  );
}
