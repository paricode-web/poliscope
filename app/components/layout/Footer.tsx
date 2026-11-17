import { Mail, Rss } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories, categoryHref, siteConfig } from "@/lib/site";
import { Logo } from "./Logo";

const headingClass = "mb-4 text-sm font-bold";
const linkClass = "text-sm text-ink-2 transition-colors hover:text-accent-strong";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tSite = await getTranslations("Site");
  const tCat = await getTranslations("Categories");
  const name = tSite("name");

  return (
    <footer className="mt-24 border-t border-line bg-canvas-2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-ink-2">{tSite("description")}</p>
        </div>

        <nav aria-label={t("categories")} className="lg:col-span-2">
          <h2 className={headingClass}>{t("categories")}</h2>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c.slug)} className={linkClass}>
                  {tCat(c.slug)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("about", { name })} className="lg:col-span-2">
          <h2 className={headingClass}>{t("about", { name })}</h2>
          <ul className="space-y-2">
            {siteConfig.about.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {t(`aboutLinks.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={headingClass}>{t("contact")}</h2>
          <ul className="space-y-2">
            <li>
              <a href={`mailto:${siteConfig.email}`} className={`${linkClass} inline-flex items-center gap-2`}>
                <Mail aria-hidden className="size-4" />
                <span dir="ltr">{siteConfig.email}</span>
              </a>
            </li>
            <li>
              <Link href="/rss.xml" className={`${linkClass} inline-flex items-center gap-2`}>
                <Rss aria-hidden className="size-4" />
                {t("rss")}
              </Link>
            </li>
            {siteConfig.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} rel="noopener noreferrer" target="_blank" className={linkClass}>
                  {t(`social.${item.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-5 text-caption text-ink-2">{t("rights", { name })}</p>
      </div>
    </footer>
  );
}