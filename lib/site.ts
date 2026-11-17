
import type { Article, CategorySlug } from "./types";

export const siteConfig = {
  name: "Poliscope",
  tagline: "نگاهی فراتر از خبر",
  description:
    "Poliscope؛ نگاهی تحلیلی به مهم‌ترین اخبار و تحولات ایران و جهان در حوزه سیاست، اقتصاد، فناوری، فرهنگ و علم.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  email: "info@didgahnews.ir",

  social: [
    { key: "telegram", href: "https://t.me/" },
    { key: "instagram", href: "https://instagram.com/" },
    { key: "x", href: "https://x.com/" },
  ],

  about: [
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
    { key: "terms", href: "/terms" },
    { key: "privacy", href: "/privacy" },
  ],
} as const;

export const categories: { slug: CategorySlug }[] = [
  { slug: "politics" },
  { slug: "world" },
  { slug: "economy" },
  { slug: "technology" },
  { slug: "culture" },
  { slug: "science" },
];

export interface NavItem {
  label: string;
  href: string;
}

export const categoryHref = (slug: CategorySlug) => `/category/${slug}`;

export const articleHref = (article: Pick<Article, "slug">) =>
  `/news/${article.slug}`;

export function findCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

// Backward-compatible alias for existing imports
export const getCategory = findCategory;

export const absoluteUrl = (path: string) =>
  new URL(path, siteConfig.url).toString();
