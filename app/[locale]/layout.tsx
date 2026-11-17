import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { BreakingTicker } from "../components/news/BreakingTicker";
import { AppToaster } from "../components/providers/AppToaster";
import { routing } from "@/i18n/routing";
import { formatRelativeTime } from "@/lib/format";
import { getBreakingNews } from "@/lib/news";
import { articleHref, siteConfig } from "@/lib/site";
import "./globals.css";

const sans = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans-fa",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const dir = locale === "fa" ? "rtl" : "ltr";

 const t = await getTranslations({
  locale,
  namespace: "Common"
});
const breaking = await getBreakingNews(locale);

  const tickerItems = breaking.map((article) => ({
    id: article.id,
    title: article.title,
    href: articleHref(article),
    time: formatRelativeTime(article.publishedAt),
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