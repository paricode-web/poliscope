# دیدگاه | بخش اول و دوم (ساختار بدون پوشهٔ `src/`)

محتوای این پوشه را روی ریشهٔ پروژه کپی کنید: `app/`، `components/`، `lib/` و `prisma/`.
این ساختار با `import prisma from "../lib/prisma"` در seed شما هم‌خوان است (یعنی `lib/` در ریشه است). اگر `tsconfig` شما alias را به شکل `"@/*": ["./*"]` دارد، چیز دیگری لازم نیست.

## قبل از کپی
- فایل‌های هم‌نام را با نسخهٔ خودتان مقایسه کنید: `app/layout.tsx`، `app/page.tsx`، `app/globals.css`، `components/ui/Button.tsx`، `components/layout/Header.tsx` و `Footer.tsx`. اگر استارتر چیزی مثل `SessionProvider` در layout دارد، آن را در `layout.tsx` جدید نگه دارید.
- اگر `Toaster` قبلاً در layout هست، `AppToaster` را حذف کنید.
- `prisma/seed.ts` همان فایل شماست؛ فقط بخش ادمین دست‌نخورده مانده و دسته‌ها و خبرهای نمونه به انتها اضافه شده‌اند.

## راه‌اندازی
```bash
npx prisma migrate dev --name add_news_models
npx prisma db seed
```
متغیر `NEXT_PUBLIC_SITE_URL` را برای sitemap، RSS و canonical تنظیم کنید.

## صفحه‌ها
`/` · `/category/[slug]` · `/news/[slug]` · `/search` · `/about` `/contact` `/terms` `/privacy` · `/sitemap.xml` · `/robots.txt` · `/rss.xml`
متن‌های «قوانین» و «حریم خصوصی» نمونه‌اند و باید با متن واقعی جایگزین شوند.
