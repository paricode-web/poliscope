import { z } from "zod";
import { categories } from "@/lib/site";
import { parseTehranLocal } from "../tehran-time"; 
export type ArticleFormKey =
  | "title"
  | "slug"
  | "summary"
  | "body"
  | "category"
  | "imageUrl"
  | "imageAlt"
  | "readMinutes"
  | "publishedAt"
  | "featuredRank"
  | "isBreaking";


export type ArticleFormValues = Record<ArticleFormKey, string>;

export interface ArticleFormState {
  message?: string;
  fieldErrors?: Partial<Record<ArticleFormKey, string>>;
  values?: ArticleFormValues;
}

const READ_MINUTES_MESSAGE = "عددی صحیح بین ۱ تا ۱۲۰ وارد کنید.";
const DATE_MESSAGE = "تاریخ و ساعت نامعتبر است.";
const RANKS = ["", "1", "2", "3", "4"];

const isCategorySlug = (value: string) => categories.some((c) => c.slug === value);

const isHttpUrl = (value: string) => {
  if (value === "") return true;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export const articleSchema = z.object({
  title: z.string().trim().min(5, "عنوان دست‌کم ۵ نویسه باشد.").max(160, "عنوان حداکثر ۱۶۰ نویسه باشد."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "slug دست‌کم ۳ نویسه باشد.")
    .max(120, "slug حداکثر ۱۲۰ نویسه باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "فقط حروف انگلیسی کوچک، عدد و خط تیره؛ مثل my-news-title"),
  summary: z.string().trim().min(10, "خلاصه دست‌کم ۱۰ نویسه باشد.").max(300, "خلاصه حداکثر ۳۰۰ نویسه باشد."),
  body: z.string().trim().min(20, "متن خبر دست‌کم ۲۰ نویسه باشد.").max(50_000, "متن خبر بیش از حد طولانی است."),
  category: z.string().refine(isCategorySlug, "دسته را انتخاب کنید."),
  imageUrl: z
    .string()
    .trim()
    .max(500, "آدرس تصویر بیش از حد طولانی است.")
    .refine(isHttpUrl, "آدرس تصویر باید با http یا https شروع شود.")
    .transform((v) => v || null),
  imageAlt: z
    .string()
    .trim()
    .max(200, "متن جایگزین حداکثر ۲۰۰ نویسه باشد.")
    .transform((v) => v || null),
  readMinutes: z
    .string()
    .regex(/^\d{1,3}$/, READ_MINUTES_MESSAGE)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 120, READ_MINUTES_MESSAGE),
  publishedAt: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v), DATE_MESSAGE)
    .transform((v) => (v === "" ? new Date() : parseTehranLocal(v)))
    .refine((d) => !Number.isNaN(d.getTime()), DATE_MESSAGE),
  isBreaking: z.string().transform((v) => v === "on"),
  featuredRank: z
    .string()
    .refine((v) => RANKS.includes(v), "جایگاه نامعتبر است.")
    .transform((v) => (v === "" ? null : Number(v))),
});

export type ArticleInput = z.output<typeof articleSchema>;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export function parseArticleForm(formData: FormData) {
  const values: ArticleFormValues = {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    category: text(formData, "category"),
    imageUrl: text(formData, "imageUrl"),
    imageAlt: text(formData, "imageAlt"),
    readMinutes: toEnglishDigits(text(formData, "readMinutes")),
    publishedAt: text(formData, "publishedAt"),
    featuredRank: text(formData, "featuredRank"),
    isBreaking: formData.get("isBreaking") === "on" ? "on" : "",
  };

  const parsed = articleSchema.safeParse(values);
  if (parsed.success) return { success: true as const, data: parsed.data, values };

  const fieldErrors: ArticleFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as ArticleFormKey] = issue.message;
    }
  }
  return {
    success: false as const,
    state: { values, fieldErrors, message: "لطفاً خطاهای فرم را اصلاح کنید." } satisfies ArticleFormState,
  };
}
