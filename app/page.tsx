import { CategorySection } from "./components/news/CategorySection"; 
import { CompactNewsCard } from "./components/news/CompactNewsCard";
import { FeaturedArticle } from "./components/news/FeaturedArticle"; 
import { NewsCard } from "./components/news/NewsCard"; 
import { NewsletterSection } from "./components/news/NewsletterSection";
import { SectionHeader } from "./components/ui/SectionHeader";
import { getHomeFeed } from "@/lib/news";
import { siteConfig } from "@/lib/site";

export const revalidate = 300; 

export default async function HomePage() {
  const { lead, secondary, latest, sections } = await getHomeFeed();

  return (
    <div className="container-page space-y-20 py-10 lg:space-y-28 lg:py-14">
      <h1 className="sr-only">
        {siteConfig.name}، {siteConfig.tagline}
      </h1>

      {lead ? (
        <section aria-label="خبرهای مهم" className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-8">
            <FeaturedArticle article={lead} />
          </div>
          <div className="flex flex-col divide-y divide-line lg:col-span-4 lg:border-s lg:border-line lg:ps-8">
            {secondary.map((article) => (
              <CompactNewsCard
                key={article.id}
                article={article}
                withImage
                showSummary
                className="py-6 first:pt-0 last:pb-0"
              />
            ))}
          </div>
        </section>
      ) : (
        <p className="py-24 text-center text-ink-2">هنوز خبری منتشر نشده است.</p>
      )}

      {latest.length > 0 && (
        <section aria-labelledby="latest-heading">
          <SectionHeader id="latest-heading" title="آخرین اخبار" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {sections.length > 0 && (
        <div className="grid gap-x-16 gap-y-16 md:grid-cols-2">
          {sections.map(({ category, articles }) => (
            <CategorySection key={category.slug} category={category} articles={articles} />
          ))}
        </div>
      )}

      <NewsletterSection />
    </div>
  );
}
