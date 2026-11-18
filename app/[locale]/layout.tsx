import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { BreakingTicker } from "../components/news/BreakingTicker";
import { AppToaster } from "../components/providers/AppToaster";
import { routing } from "@/i18n/routing";
import { getBreakingNews } from "@/lib/news";
import { articleHref, siteConfig } from "@/lib/site";
import "./globals.css";

const sans = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans-fa",
  display: "swap",
});

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const resolveLocale = (raw: string) => (hasLocale(routing.locales, raw) ? raw : routing.defaultLocale);

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  const name = t("name");
  const title = `${name} | ${t("tagline")}`;
  const description = t("description");

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    openGraph: {
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      siteName: name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      types: { "application/rss+xml": "/rss.xml" },
    },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const dir = locale === "fa" ? "rtl" : "ltr";

  const t = await getTranslations({ locale, namespace: "Common" });
  const format = await getFormatter({ locale });
  const breaking = await getBreakingNews(locale);

  const tickerItems = breaking.map((article) => ({
    id: article.id,
    title: article.title,
    href: articleHref(article),
    time: format.relativeTime(new Date(article.publishedAt)),
  }));

  return (
    <html
      lang={locale}
      dir={dir}
      className={sans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-accent-strong focus:px-4 focus:py-2 focus:text-accent-ink"
          >
            {t("skipToContent")}
          </a>

          <Header />
          <BreakingTicker items={tickerItems} />

          <main id="main" className="flex-1">
            {children}
          </main>

          <Footer />
          <AppToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
