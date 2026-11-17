import { Link } from "@/i18n/navigation";
import { CategoryBadge } from "../ui/CategoryBadge";
import { CoverImage } from "../ui/CoverImage";
import { articleHref } from "@/lib/site";
import type { Article } from "@/lib/types";
import { ArticleMeta } from "./ArticleMeta";

export function FeaturedArticle({ article }: { article: Article }) {
  const href = articleHref(article);
  return (
    <article>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <CoverImage
          image={article.image}
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="aspect-[16/9] rounded-lg"
        />
      </Link>
      <div className="mt-6">
        <CategoryBadge slug={article.category} />
        <h2 className="mt-3 text-h3 font-extrabold tracking-tight md:text-h2 lg:text-h1">
          <Link href={href} className="transition-colors hover:text-accent-strong">
            {article.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-2">{article.summary}</p>
        <ArticleMeta article={article} className="mt-4" />
      </div>
    </article>
  );
}
