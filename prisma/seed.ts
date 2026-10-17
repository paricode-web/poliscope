import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { categories } from "../lib/site";
import { seedArticles } from "./seed-data";
const SAMPLE_BODY = [
  "این متن نمونه است و برای نمایش چیدمان صفحهٔ خبر استفاده می‌شود. در نسخهٔ نهایی، متن کامل گزارش جایگزین آن خواهد شد.",
  "پاراگراف‌ها با یک خط خالی از هم جدا می‌شوند و بدون هیچ کد HTML نمایش داده می‌شوند. فاصلهٔ خطوط و عرض ستون برای خواندن طولانی تنظیم شده است.",
];

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { slug: category.slug, name: category.name },
    });
  }
  console.log(`✅ Categories ready: ${categories.length}`);

  for (const item of seedArticles) {
    await prisma.article.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        body: [item.summary, ...SAMPLE_BODY].join("\n\n"),
        readMinutes: item.readMinutes,
        isBreaking: item.isBreaking ?? false,
        featuredRank: item.featuredRank,
        publishedAt: new Date(Date.now() - item.minutesAgo * 60_000),
        category: { connect: { slug: item.category } },
        author: { connect: { id: adminUser.id } },
      },
    });
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
