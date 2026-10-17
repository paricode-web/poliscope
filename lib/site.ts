import type { Article, Category, CategorySlug } from "./types";

export const siteConfig = {
  name: "دیدگاه",
  tagline: "رسانهٔ خبری تحلیلی",
  description:
    "دیدگاه رسانه‌ای مستقل و تحلیلی است که با هدف ارائهٔ اخبار دقیق، تحلیل‌های عمیق و نگاهی متفاوت به رویدادهای مهم فعالیت می‌کند.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@didgahnews.ir",
  social: [
    { label: "تلگرام", href: "https://t.me/" },
    { label: "اینستاگرام", href: "https://instagram.com/" },
    { label: "ایکس", href: "https://x.com/" },
  ],
  about: [
    { label: "دربارهٔ ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
    { label: "قوانین و شرایط", href: "/terms" },
    { label: "حریم خصوصی", href: "/privacy" },
  ],
} as const;

export const categories: Category[] = [
  { slug: "politics", name: "سیاست" },
  { slug: "world", name: "جهان" },
  { slug: "economy", name: "اقتصاد" },
  { slug: "technology", name: "فناوری" },
  { slug: "culture", name: "فرهنگ" },
  { slug: "science", name: "علم" },
];

export interface NavItem {
  label: string;
  href: string;
}

export const categoryHref = (slug: CategorySlug) => `/category/${slug}`;
export const articleHref = (article: Pick<Article, "slug">) => `/news/${article.slug}`;

export const navItems: NavItem[] = [
  { label: "صفحهٔ اصلی", href: "/" },
  ...categories.map((c) => ({ label: c.name, href: categoryHref(c.slug) })),
];

export function findCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}
