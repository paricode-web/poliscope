"use server";

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
    .replace(/[\u200c\s]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveArticle(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const session = await requireAdmin();

  const localeParam = text(fd, "locale") || "fa";
  const locale = toLocale(localeParam);
  const originalSlug = text(fd, "originalSlug");
  const title = text(fd, "title");
  const summary = text(fd, "summary");
  const body = text(fd, "body");
  const type = text(fd, "type") as ArticleType;
  const categorySlug = text(fd, "categorySlug");
  const status =
    text(fd, "status") === "DRAFT" ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED;

  if (!title) return { error: "عنوان را وارد کنید." };
  if (!summary) return { error: "خلاصه را وارد کنید." };
  if (!body) return { error: "متن را وارد کنید." };
  if (!categorySlug) return { error: "یک دسته انتخاب کنید." };
  if (!(type in ArticleType)) return { error: "نوع محتوا نامعتبر است." };

  const slug = slugify(text(fd, "slug") || title);
  if (!slug) return { error: "نشانی (slug) معتبر نیست." };

  const publishedAtRaw = text(fd, "publishedAt");
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
  if (Number.isNaN(publishedAt.getTime())) {
    return { error: "زمان انتشار معتبر نیست." };
  }

  const rank = text(fd, "featuredRank");

  const data = {
    slug,
    title,
    summary,
    body,
    type,
    status,
    readMinutes: Math.max(1, Math.ceil(body.split(/\s+/).length / 180)),
    isBreaking: fd.get("isBreaking") === "on",
    featuredRank: rank ? Number(rank) : null,
    publishedAt,
    imageUrl: text(fd, "imageUrl") || null,
    imageAlt: text(fd, "imageAlt") || null,
    category: { connect: { slug: categorySlug } },
  };

  try {
    if (originalSlug) {
      const existing = await prisma.article.findFirst({
        where: { locale, slug: originalSlug },
        select: { id: true },
      });
      if (!existing) return { error: "این مورد پیدا نشد؛ شاید حذف شده باشد." };

      await prisma.article.update({ where: { id: existing.id }, data });
    } else {
      const author = await prisma.user.findUnique({
        where: { email: session.user?.email ?? "" },
      });
      await prisma.article.create({
        data: {
          ...data,
          locale,
          ...(author ? { author: { connect: { id: author.id } } } : {}),
        },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "این نشانی (slug) قبلاً استفاده شده است." };
    }
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/", "layout");
  redirect(`/${localeParam}/admin/articles?saved=1`);
}

export async function deleteArticle(fd: FormData) {
  await requireAdmin();
  const slug = text(fd, "slug");
  const localeParam = text(fd, "locale") || "fa";

  if (slug) {
    await prisma.article.deleteMany({
      where: { locale: toLocale(localeParam), slug },
    });
  }

  revalidatePath("/", "layout");
  redirect(`/${localeParam}/admin/articles?deleted=1`);
}