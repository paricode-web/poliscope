import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CoverImage } from "../ui/CoverImage";
import { SectionHeader } from "../ui/SectionHeader";
import { articleHref, categoryHref } from "@/lib/site";
import type { Article, Category } from "@/lib/types";
import { ArticleMeta } from "./ArticleMeta";
import { CompactNewsCard } from "./CompactNewsCard";

interface CategorySectionProps {
  category: Category;
  articles: Article[];
}

export function CategorySection({ category, articles }: CategorySectionProps) {
  const tCat = useTranslations("Categories");
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const headingId = `section-${category.slug}`;

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader id={headingId} title={tCat(category.slug)} href={categoryHref(category.slug)} />
      <article>
        <Link href={articleHref(lead)} tabIndex={-1} aria-hidden="true" className="block">
          <CoverImage image={lead.image} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[16/9] rounded-lg" />
        </Link>
        <h3 className="mt-4 text-xl font-bold leading-9">
          <Link href={articleHref(lead)} className="transition-colors hover:text-accent-strong">
            {lead.title}
          </Link>
        </h3>
        <ArticleMeta article={lead} showReadTime={false} className="mt-2" />
      </article>
      {rest.length > 0 && (
        <div className="mt-5 divide-y divide-line border-t border-line">
          {rest.map((article) => (
            <CompactNewsCard key={article.id} article={article} showCategory={false} className="py-4" />
          ))}
        </div>
      )}
    </section>
  );
}
