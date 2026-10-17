"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  parseArticleForm,
  type ArticleFormState,
  type ArticleFormValues,
} from "@/lib/validations/article"

const GENERIC_ERROR = "ذخیره‌سازی انجام نشد. لطفاً دوباره تلاش کنید.";

function writeError(error: unknown, values: ArticleFormValues): ArticleFormState {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return {
      values,
      message: "لطفاً خطاهای فرم را اصلاح کنید.",
      fieldErrors: { slug: "این slug قبلاً برای خبر دیگری استفاده شده است." },
    };
  }
  console.error("Article write failed:", error);
  return { values, message: GENERIC_ERROR };
}


const revalidateSite = () => revalidatePath("/", "layout");

export async function createArticle(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const session = await requireAdmin();
  const parsed = parseArticleForm(formData);
  if (!parsed.success) return parsed.state;
        
  const email = session.user?.email;
  if (!email) return { values: parsed.values, message: "نشست معتبر نیست؛ دوباره وارد شوید." };

  const { category, featuredRank, ...data } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
    
      if (featuredRank !== null) {
        await tx.article.updateMany({ where: { featuredRank }, data: { featuredRank: null } });
      }
      await tx.article.create({
        data: {
          ...data,
          featuredRank,
          category: { connect: { slug: category } },
          author: { connect: { email } },
        },
      });
    });
  } catch (error) {
    return writeError(error, parsed.values);
  }

  revalidateSite();
  redirect("/admin/articles?saved=created");
}

export async function updateArticle(
  id: string,
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();
  const parsed = parseArticleForm(formData);
  if (!parsed.success) return parsed.state;

  const { category, featuredRank, ...data } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      if (featuredRank !== null) {
        await tx.article.updateMany({
          where: { featuredRank, id: { not: id } },
          data: { featuredRank: null },
        });
      }
      await tx.article.update({
        where: { id },
        data: { ...data, featuredRank, category: { connect: { slug: category } } },
      });
    });
  } catch (error) {
    return writeError(error, parsed.values);
  }

  revalidateSite();
  redirect("/admin/articles?saved=updated");
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  try {
    await prisma.article.delete({ where: { id } });
  } catch (error) {

    const alreadyGone = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
    if (!alreadyGone) throw error;
  }

  revalidateSite();
  redirect("/admin/articles?saved=deleted");
}
