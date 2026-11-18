"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArticleStatus, ArticleType, Locale, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type FormState = { error?: string };

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const toLocale = (v: string): Locale => (v.toLowerCase() === "en" ? Locale.EN : Locale.FA);

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[‌\s]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const readMinutes = (body: string, wordsPerMinute: number) =>
  Math.max(1, Math.ceil(body.split(/\s+/).length / wordsPerMinute));

/** فیلدهای مشترک بین دو نسخه (تصویر، دسته، نوع، فوری، شاخص، زمان انتشار). */
type Shared = Pick<
  Prisma.ArticleCreateInput,
  "type" | "isBreaking" | "featuredRank" | "publishedAt" | "imageUrl" | "category"
>;

/** فیلدهای مخصوص هر زبان. */
type Version = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: ArticleStatus;
  readMinutes: number;
  imageAlt: string | null;
};

/**
 * هر نسخه با (locale, translationKey) پیدا می‌شود؛ اگر باشد ویرایش و اگر نباشد ساخته می‌شود.
 * به‌خاطر قید یکتای دیتابیس، رکورد تکراری برای یک زبان هرگز ساخته نمی‌شود.
 */
function upsertVersion(args: {
  locale: Locale;
  translationKey: string;
  shared: Shared;
  version: Version;
  authorId?: string;
}) {
  const { locale, translationKey, shared, version, authorId } = args;
  return prisma.article.upsert({
    where: { locale_translationKey: { locale, translationKey } },
    update: { ...shared, ...version },
    create: {
      ...shared,
      ...version,
      locale,
      translationKey,
      ...(authorId ? { author: { connect: { id: authorId } } } : {}),
    },
  });
}

/** آیا این slug در همین زبان برای خبر دیگری استفاده شده است؟ */
async function slugTaken(locale: Locale, slug: string, translationKey: string) {
  const clash = await prisma.article.findFirst({
    where: { locale, slug, NOT: { translationKey } },
    select: { id: true },
  });
  return Boolean(clash);
}

export async function saveArticle(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin();

  const localeParam = text(fd, "locale") || "fa";
  const originalSlug = text(fd, "originalSlug");

  // ───────── فیلدهای مشترک ─────────
  const type = text(fd, "type") as ArticleType;
  const categorySlug = text(fd, "categorySlug");
  if (!categorySlug) return { error: "یک دسته انتخاب کنید." };
  if (!(type in ArticleType)) return { error: "نوع محتوا نامعتبر است." };

  const publishedAtRaw = text(fd, "publishedAt");
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
  if (Number.isNaN(publishedAt.getTime())) return { error: "زمان انتشار معتبر نیست." };

  const rank = text(fd, "featuredRank");

  const shared: Shared = {
    type,
    isBreaking: fd.get("isBreaking") === "on",
    featuredRank: rank ? Number(rank) : null,
    publishedAt,
    imageUrl: text(fd, "imageUrl") || null,
    category: { connect: { slug: categorySlug } },
  };

  // ───────── نسخهٔ فارسی ─────────
  const faTitle = text(fd, "title");
  const faSummary = text(fd, "summary");
  const faBody = text(fd, "body");
  if (!faTitle) return { error: "عنوان فارسی را وارد کنید." };
  if (!faSummary) return { error: "خلاصهٔ فارسی را وارد کنید." };
  if (!faBody) return { error: "متن فارسی را وارد کنید." };

  const faSlug = slugify(text(fd, "slug") || faTitle);
  if (!faSlug) return { error: "نشانی (slug) فارسی معتبر نیست." };

  const fa: Version = {
    slug: faSlug,
    title: faTitle,
    summary: faSummary,
    body: faBody,
    status: text(fd, "status") === "DRAFT" ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED,
    readMinutes: readMinutes(faBody, 180),
    imageAlt: text(fd, "imageAlt") || null,
  };

  // ───────── نسخهٔ انگلیسی (اختیاری) ─────────
  const enTitle = text(fd, "en_title");
  const enSummary = text(fd, "en_summary");
  const enBody = text(fd, "en_body");
  const enFilled = [enTitle, enSummary, enBody].filter(Boolean).length;

  if (enFilled > 0 && enFilled < 3) {
    return { error: "برای ذخیرهٔ نسخهٔ انگلیسی، عنوان، خلاصه و متن انگلیسی هر سه باید پر باشند." };
  }

  let en: Version | null = null;
  if (enFilled === 3) {
    const enSlug = slugify(text(fd, "en_slug") || enTitle);
    if (!enSlug) return { error: "نشانی (slug) انگلیسی معتبر نیست." };

    en = {
      slug: enSlug,
      title: enTitle,
      summary: enSummary,
      body: enBody,
      status: text(fd, "en_status") === "PUBLISHED" ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
      readMinutes: readMinutes(enBody, 200),
      imageAlt: text(fd, "en_imageAlt") || null,
    };
  }

  // ───────── کلید اتصال ترجمه‌ها ─────────
  let translationKey = text(fd, "translationKey");

  if (!translationKey && originalSlug) {
    // سازگاری با صفحهٔ ویرایشی که هنوز translationKey نمی‌فرستد.
    const base = await prisma.article.findFirst({
      where: { locale: Locale.FA, slug: originalSlug },
      select: { translationKey: true },
    });
    if (!base) return { error: "این مورد پیدا نشد؛ شاید حذف شده باشد." };
    translationKey = base.translationKey;
  }

  const isNew = !translationKey;
  if (isNew) translationKey = randomUUID();

  // اگر ترجمهٔ انگلیسی از قبل وجود دارد، با خالی گذاشتن فیلدها بی‌صدا حذف یا رها نمی‌شود.
  if (!isNew && !en) {
    const existingEn = await prisma.article.findUnique({
      where: { locale_translationKey: { locale: Locale.EN, translationKey } },
      select: { id: true },
    });
    if (existingEn) {
      return {
        error:
          "نسخهٔ انگلیسی این خبر وجود دارد؛ فیلدهای آن را خالی نکنید. برای پنهان کردنش، وضعیت انگلیسی را روی «پیش‌نویس» بگذارید.",
      };
    }
  }

  // ───────── slug تکراری (با پیام جدا برای هر زبان) ─────────
  if (await slugTaken(Locale.FA, fa.slug, translationKey)) {
    return { error: "این نشانی (slug) فارسی قبلاً استفاده شده است." };
  }
  if (en && (await slugTaken(Locale.EN, en.slug, translationKey))) {
    return { error: "این English slug قبلاً استفاده شده است." };
  }

  // ───────── ذخیره، همه‌یا‌هیچ ─────────
  try {
    const author = await prisma.user.findUnique({
      where: { email: session.user?.email ?? "" },
      select: { id: true },
    });

    const operations = [
      upsertVersion({ locale: Locale.FA, translationKey, shared, version: fa, authorId: author?.id }),
      ...(en
        ? [upsertVersion({ locale: Locale.EN, translationKey, shared, version: en, authorId: author?.id })]
        : []),
    ];

    await prisma.$transaction(operations);
  } catch (e) {
    console.error("saveArticle failed:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "این نشانی (slug) قبلاً استفاده شده است." };
    }
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/", "layout");
  redirect(`/${localeParam}/admin/articles?saved=1`);
}

/** حذف خبر: هر دو نسخهٔ فارسی و انگلیسی با هم حذف می‌شوند. */
export async function deleteArticle(fd: FormData) {
  await requireAdmin();

  const slug = text(fd, "slug");
  const localeParam = text(fd, "locale") || "fa";
  let translationKey = text(fd, "translationKey");

  if (!translationKey && slug) {
    const row = await prisma.article.findFirst({
      where: { locale: toLocale(localeParam), slug },
      select: { translationKey: true },
    });
    translationKey = row?.translationKey ?? "";
  }

  if (translationKey) {
    await prisma.article.deleteMany({ where: { translationKey } });
  }

  revalidatePath("/", "layout");
  redirect(`/${localeParam}/admin/articles?deleted=1`);
}