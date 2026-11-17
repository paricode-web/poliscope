import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { categories } from "../lib/site";
import type { CategorySlug } from "../lib/types";
import { seedArticles } from "./seed-data";

/** نام دسته‌ها فقط در دیتابیس لازم است؛ رابط کاربری آن‌ها را از فایل ترجمه می‌خواند. */
const categoryNames: Record<CategorySlug, string> = {
  politics: "سیاست",
  world: "جهان",
  economy: "اقتصاد",
  technology: "فناوری",
  culture: "فرهنگ",
  science: "علم",
};

const SAMPLE_BODY_FA = [
  "این متن نمونه است و برای نمایش چیدمان صفحهٔ خبر استفاده می‌شود. در نسخهٔ نهایی، متن کامل گزارش جایگزین آن خواهد شد.",
  "پاراگراف‌ها با یک خط خالی از هم جدا می‌شوند و بدون هیچ کد HTML نمایش داده می‌شوند. فاصلهٔ خطوط و عرض ستون برای خواندن طولانی تنظیم شده است.",
];

const SAMPLE_BODY_EN = [
  "This is sample text used to preview the layout of the article page. In the final version, the full report will replace it.",
  "Paragraphs are separated by a blank line and rendered without any HTML. Line spacing and column width are tuned for long-form reading.",
];

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env");
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", password: hashedPassword },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  for (const category of categories) {
    const name = categoryNames[category.slug];
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name },
      create: { slug: category.slug, name },
    });
  }
  console.log(`✅ Categories ready: ${categories.length}`);

  for (const item of seedArticles) {
    const common = {
      type: "NEWS" as const,
      readMinutes: item.readMinutes,
      isBreaking: item.isBreaking ?? false,
      featuredRank: item.featuredRank,
      publishedAt: new Date(Date.now() - item.minutesAgo * 60_000),
      category: { connect: { slug: item.category } },
      author: { connect: { id: adminUser.id } },
      // هر دو نسخهٔ یک خبر با همین کلید به هم وصل می‌شوند.
      translationKey: item.slug,
    };

    await prisma.article.upsert({
      where: { locale_slug: { locale: "FA", slug: item.slug } },
      update: { translationKey: item.slug },
      create: {
        ...common,
        locale: "FA",
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        body: [item.summary, ...SAMPLE_BODY_FA].join("\n\n"),
      },
    });

    // نسخهٔ انگلیسی فقط برای آیتم‌هایی ساخته می‌شود که در seed-data فیلد `en` دارند.
    if (item.en) {
      await prisma.article.upsert({
        where: { locale_slug: { locale: "EN", slug: item.slug } },
        update: { translationKey: item.slug },
        create: {
          ...common,
          locale: "EN",
          slug: item.slug,
          title: item.en.title,
          summary: item.en.summary,
          body: [item.en.summary, ...SAMPLE_BODY_EN].join("\n\n"),
        },
      });
    }
  }
  console.log(`✅ Articles ready: ${seedArticles.length}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
