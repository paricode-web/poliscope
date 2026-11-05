
import Link from "next/link";
import { Mail, Rss } from "lucide-react";
import { categories, categoryHref, siteConfig } from "@/lib/site";
import { Logo } from "./Logo";

const headingClass = "mb-4 text-sm font-bold";
const linkClass =
  "text-sm text-ink-2 transition-colors hover:text-accent-strong";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas-2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-ink-2">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="دسته‌بندی‌ها" className="lg:col-span-2">
          <h2 className={headingClass}>دسته‌بندی‌ها</h2>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c.slug)} className={linkClass}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          aria-label={`دربارهٔ ${siteConfig.name}`}
          className="lg:col-span-2"
        >
          <h2 className={headingClass}>
            دربارهٔ {siteConfig.name}
          </h2>
          <ul className="space-y-2">
            {siteConfig.about.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={headingClass}>ارتباط با ما</h2>
          <ul className="space-y-2">
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className={`${linkClass} inline-flex items-center gap-2`}
              >
                <Mail aria-hidden className="size-4" />
                <span dir="ltr">{siteConfig.email}</span>
              </a>
            </li>

            <li>
              <Link
                href="/rss.xml"
                className={`${linkClass} inline-flex items-center gap-2`}
              >
                <Rss aria-hidden className="size-4" />
                خوراک RSS
              </Link>
            </li>

            {siteConfig.social.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className={linkClass}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-5 text-caption text-ink-2">
          تمام حقوق برای {siteConfig.name} محفوظ است.
        </p>
      </div>
    </footer>
  );
}
