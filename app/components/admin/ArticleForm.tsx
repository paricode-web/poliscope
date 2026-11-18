"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { saveArticle } from "@/lib/actions/article-actions";

export type ArticleTypeValue =
  | "NEWS"
  | "ARTICLE"
  | "ANALYSIS"
  | "NOTE"
  | "BOOK_REVIEW"
  | "INTERVIEW";

/** فیلدهای نسخهٔ فارسی + فیلدهای مشترک بین هر دو نسخه. */
export type ArticleFormValues = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  type: ArticleTypeValue;
  status: "PUBLISHED" | "DRAFT";
  categorySlug: string;
  imageUrl: string;
  imageAlt: string;
  isBreaking: boolean;
  featuredRank: string;
  publishedAt: string;
};

/** فیلدهای مخصوص نسخهٔ انگلیسی. */
export type TranslationFormValues = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: "PUBLISHED" | "DRAFT";
  imageAlt: string;
};

const DEFAULTS: ArticleFormValues = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  type: "NEWS",
  status: "PUBLISHED",
  categorySlug: "",
  imageUrl: "",
  imageAlt: "",
  isBreaking: false,
  featuredRank: "",
  publishedAt: "",
};

// نسخهٔ انگلیسی تا وقتی مدیر ترجمه را بازبینی نکرده، پیش‌نویس است.
const EN_DEFAULTS: TranslationFormValues = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  status: "DRAFT",
  imageAlt: "",
};

const TYPES = [
  { value: "NEWS", label: "خبر", hint: "گزارش کوتاه" },
  { value: "ARTICLE", label: "مقاله", hint: "متن بلند" },
  { value: "ANALYSIS", label: "تحلیل", hint: "بررسی عمیق" },
  { value: "NOTE", label: "یادداشت", hint: "نظر کوتاه" },
  { value: "BOOK_REVIEW", label: "نقد کتاب", hint: "معرفی و نقد" },
  { value: "INTERVIEW", label: "گفتگو", hint: "پرسش و پاسخ" },
] as const;

const field =
  "w-full rounded-md border border-line bg-canvas px-3.5 py-2.5 text-ink placeholder:text-ink-2/60 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft";

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** متنی که مدیر در ChatGPT می‌چسباند. قالب خروجی طوری است که دکمهٔ «پر کردن فیلدها» بتواند آن را بخواند. */
function buildTranslationPrompt(title: string, summary: string, body: string) {
  return [
    "Translate the following Persian news article into natural, professional English.",
    "Keep the paragraph structure: paragraphs are separated by a blank line.",
    "Do not add or remove information. Reply in exactly this format and nothing else:",
    "",
    "TITLE:",
    "<translated title>",
    "",
    "SUMMARY:",
    "<translated summary>",
    "",
    "BODY:",
    "<translated body>",
    "",
    "----- Persian article -----",
    "",
    "Title:",
    title,
    "",
    "Summary:",
    summary,
    "",
    "Body:",
    body,
  ].join("\n");
}

function parseTranslation(raw: string) {
  const match = raw.match(/TITLE:\s*([\s\S]*?)\s*SUMMARY:\s*([\s\S]*?)\s*BODY:\s*([\s\S]*)$/i);
  if (!match) return null;
  const clean = (value: string) => value.replace(/\*\*/g, "").trim();
  const [title, summary, body] = [clean(match[1]), clean(match[2]), match[3].trim()];
  return title && summary && body ? { title, summary, body } : null;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="mb-4 border-s-4 border-accent ps-3 text-base font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-caption text-ink-2">{hint}</span>}
    </label>
  );
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-md bg-accent-strong px-6 py-3 font-bold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "در حال ذخیره…" : editing ? "ذخیرهٔ تغییرات" : "ذخیره و انتشار"}
    </button>
  );
}

export function ArticleForm({
  locale,
  categories,
  values,
  originalSlug,
  enValues,
  enOriginalSlug,
  translationKey,
}: {
  locale: string;
  categories: { slug: string; name: string }[];
  /** مقدارهای نسخهٔ فارسی و فیلدهای مشترک */
  values?: Partial<ArticleFormValues>;
  /** slug فعلی نسخهٔ فارسی (فقط در ویرایش) */
  originalSlug?: string;
  /** مقدارهای نسخهٔ انگلیسی (فقط اگر ترجمه از قبل وجود دارد) */
  enValues?: Partial<TranslationFormValues>;
  /** slug فعلی نسخهٔ انگلیسی (فقط اگر ترجمه از قبل وجود دارد) */
  enOriginalSlug?: string;
  /** کلید مشترک دو نسخه (فقط در ویرایش) */
  translationKey?: string;
}) {
  const v = { ...DEFAULTS, ...values };
  const en = { ...EN_DEFAULTS, ...enValues };
  const editing = Boolean(originalSlug || translationKey);

  const [state, action] = useActionState(saveArticle, {} as { error?: string });
  const [imageUrl, setImageUrl] = useState(v.imageUrl);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // نسخهٔ فارسی
  const [title, setTitle] = useState(v.title);
  const [summary, setSummary] = useState(v.summary);
  const [body, setBody] = useState(v.body);

  // نسخهٔ انگلیسی
  const [enTitle, setEnTitle] = useState(en.title);
  const [enSummary, setEnSummary] = useState(en.summary);
  const [enBody, setEnBody] = useState(en.body);

  // ابزار ترجمه با ChatGPT
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState("");

  const words = countWords(body);
  const enWords = countWords(enBody);

  const enFilled = [enTitle, enSummary, enBody].filter((s) => s.trim()).length;
  const enPartial = enFilled > 0 && enFilled < 3;
  const canCopyPrompt = Boolean(title.trim() && summary.trim() && body.trim());

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(buildTranslationPrompt(title.trim(), summary.trim(), body.trim()));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setPasteError("کپی انجام نشد. اجازهٔ دسترسی به کلیپ‌بورد را بررسی کنید.");
    }
  }

  function applyPaste() {
    const parsed = parseTranslation(pasteText);
    if (!parsed) {
      setPasteError("قالب پاسخ شناخته نشد. باید شامل TITLE:، SUMMARY: و BODY: باشد.");
      return;
    }
    setPasteError("");
    setEnTitle(parsed.title);
    setEnSummary(parsed.summary);
    setEnBody(parsed.body);
    setPasteText("");
  }

  async function upload(file: File) {
    setUploadError("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/auth/admin/upload", {
        method: "POST",
        body: fd,
      });

      const responseText = await res.text();

      let data: { url?: string; error?: string } = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`پاسخ سرور معتبر نیست. وضعیت: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "آپلود ناموفق بود.");
      }

      if (!data.url) {
        throw new Error("آدرس تصویر از سرور دریافت نشد.");
      }

      setImageUrl(data.url);
    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      setUploadError(e instanceof Error ? e.message : "آپلود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void upload(file);
    e.target.value = "";
  }

  const fileInput = (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      className="sr-only"
      onChange={onPick}
    />
  );

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="originalSlug" value={originalSlug ?? ""} />
      <input type="hidden" name="enOriginalSlug" value={enOriginalSlug ?? ""} />
      <input type="hidden" name="translationKey" value={translationKey ?? ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* ستون اصلی */}
      <div className="space-y-6">
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-accent bg-accent-soft px-4 py-3 font-bold text-ink"
          >
            {state.error}
          </p>
        )}

        <Card title="محتوای فارسی">
          <div className="space-y-5">
            <Field label="عنوان">
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="عنوان جذاب و روشن بنویسید"
                className={`${field} text-lg font-bold`}
              />
            </Field>

            <Field label="خلاصه" hint="در کارت‌ها و نتایج جست‌وجو نمایش داده می‌شود.">
              <textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                rows={3}
                maxLength={300}
                className={`${field} leading-7`}
              />
            </Field>

            <Field label="متن کامل" hint="پاراگراف‌ها را با یک خط خالی از هم جدا کنید.">
              <textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={16}
                className={`${field} min-h-[360px] leading-8`}
              />
            </Field>
            <p className="-mt-3 text-caption text-ink-2">
              {words.toLocaleString("fa-IR")} کلمه · حدود{" "}
              {Math.max(1, Math.ceil(words / 180)).toLocaleString("fa-IR")} دقیقه مطالعه
            </p>
          </div>
        </Card>

        <Card title="محتوای انگلیسی (English)">
          <div className="space-y-5">
            <p className="text-sm text-ink-2">
              {enOriginalSlug
                ? "نسخهٔ انگلیسی این خبر وجود دارد؛ تغییرها روی همان ذخیره می‌شود."
                : "اختیاری است. اگر هر سه فیلد را خالی بگذارید، فقط نسخهٔ فارسی ذخیره می‌شود."}
            </p>

            <div className="space-y-3 rounded-md border border-dashed border-line bg-canvas-2 p-4">
              <p className="text-sm font-bold">ترجمه با ChatGPT</p>
              <ol className="list-decimal space-y-1 ps-5 text-caption text-ink-2">
                <li>متن فارسی را بالا کامل کنید و «کپی درخواست ترجمه» را بزنید.</li>
                <li>آن را در ChatGPT بچسبانید و پاسخ را کپی کنید.</li>
                <li>پاسخ را در کادر زیر بچسبانید و «پر کردن فیلدها» را بزنید، سپس ترجمه را بازبینی کنید.</li>
              </ol>
              <button
                type="button"
                onClick={copyPrompt}
                disabled={!canCopyPrompt}
                className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-bold transition hover:border-accent disabled:opacity-50"
              >
                {copied ? "کپی شد ✓" : "کپی درخواست ترجمه"}
              </button>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={4}
                dir="ltr"
                placeholder={"TITLE:\n…\n\nSUMMARY:\n…\n\nBODY:\n…"}
                className={`${field} text-sm`}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={applyPaste}
                  disabled={!pasteText.trim()}
                  className="rounded-md bg-accent-strong px-4 py-2 text-sm font-bold text-accent-ink transition hover:opacity-90 disabled:opacity-50"
                >
                  پر کردن فیلدها
                </button>
                {pasteError && (
                  <span role="alert" className="text-sm font-bold text-accent-strong">
                    {pasteError}
                  </span>
                )}
              </div>
            </div>

            {enPartial && (
              <p role="alert" className="text-sm font-bold text-accent-strong">
                برای ذخیرهٔ نسخهٔ انگلیسی، عنوان، خلاصه و متن هر سه باید پر باشند.
              </p>
            )}

            <div dir="ltr" className="space-y-5">
              <Field label="English Title">
                <input
                  name="en_title"
                  value={enTitle}
                  onChange={(e) => setEnTitle(e.target.value)}
                  placeholder="Write a clear, engaging headline"
                  className={`${field} text-lg font-bold`}
                />
              </Field>

              <Field label="English Summary">
                <textarea
                  name="en_summary"
                  value={enSummary}
                  onChange={(e) => setEnSummary(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className={`${field} leading-7`}
                />
              </Field>

              <Field label="English Body">
                <textarea
                  name="en_body"
                  value={enBody}
                  onChange={(e) => setEnBody(e.target.value)}
                  rows={16}
                  className={`${field} min-h-[360px] leading-8`}
                />
              </Field>
              <p className="-mt-3 text-caption text-ink-2">
                {enWords.toLocaleString("en-US")} words · about {Math.max(1, Math.ceil(enWords / 200))} min read
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ستون کناری */}
      <aside className="space-y-6 lg:sticky lg:top-6">
        <Card title="نوع محتوا">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="نوع محتوا">
            {TYPES.map((k) => (
              <label key={k.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={k.value}
                  defaultChecked={k.value === v.type}
                  className="peer sr-only"
                />
                <span className="block rounded-md border border-line px-2 py-2.5 text-center transition hover:border-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                  <span className="block text-sm font-extrabold">{k.label}</span>
                  <span className="block text-caption text-ink-2">{k.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Card title="انتشار">
          <div className="space-y-4">
            <Field label="وضعیت نسخهٔ فارسی">
              <select name="status" defaultValue={v.status} className={field}>
                <option value="PUBLISHED">منتشرشده</option>
                <option value="DRAFT">پیش‌نویس (روی سایت نمایش داده نمی‌شود)</option>
              </select>
            </Field>

            <Field
              label="وضعیت نسخهٔ انگلیسی"
              hint="مستقل از نسخهٔ فارسی است. تا بازبینی ترجمه، پیش‌نویس بماند."
            >
              <select name="en_status" defaultValue={en.status} className={field}>
                <option value="DRAFT">پیش‌نویس (روی سایت نمایش داده نمی‌شود)</option>
                <option value="PUBLISHED">منتشرشده</option>
              </select>
            </Field>

            <Field label="دسته">
              <select
                name="categorySlug"
                defaultValue={v.categorySlug}
                required
                className={field}
              >
                <option value="" disabled>
                  انتخاب کنید…
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="زمان انتشار"
              hint="برای هر دو نسخه یکی است. خالی = همین الان. تاریخ آینده یعنی زمان‌بندی."
            >
              <input
                type="datetime-local"
                name="publishedAt"
                defaultValue={v.publishedAt}
                className={field}
              />
            </Field>

            <Field label="جایگاه شاخص" hint="عدد کوچک‌تر یعنی بالاتر. برای نمایش عادی خالی بگذارید.">
              <input
                type="number"
                name="featuredRank"
                min={1}
                max={10}
                defaultValue={v.featuredRank}
                className={field}
              />
            </Field>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-bold">خبر فوری</span>
                <span className="block text-caption text-ink-2">در نوار فوری سایت نمایش داده می‌شود</span>
              </span>
              <input
                type="checkbox"
                name="isBreaking"
                defaultChecked={v.isBreaking}
                className="peer sr-only"
              />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-accent-strong peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:transition peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
            </label>
          </div>
        </Card>

        <Card title="تصویر شاخص">
          {imageUrl ? (
            <div className="overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 bg-canvas-2 px-3 py-2 text-sm">
                <label className="cursor-pointer font-medium hover:text-accent-strong">
                  {busy ? "در حال بارگذاری…" : "تغییر تصویر"}
                  {fileInput}
                </label>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="font-medium text-accent-strong hover:underline"
                >
                  حذف تصویر
                </button>
              </div>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void upload(file);
              }}
              className={`flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 text-center transition ${
                dragging ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="text-accent-strong">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m21 16-5-5-8 9" />
              </svg>
              <span className="font-bold">
                {busy ? "در حال بارگذاری…" : "تصویر را بکشید و رها کنید"}
              </span>
              <span className="text-caption text-ink-2">
                یا کلیک کنید · JPG، PNG، WebP تا ۵ مگابایت
              </span>
              {fileInput}
            </label>
          )}

          {uploadError && (
            <p role="alert" className="mt-2 text-sm font-bold text-accent-strong">
              {uploadError}
            </p>
          )}

          <div className="mt-4 space-y-4">
            <Field label="متن جایگزین تصویر (فارسی)" hint="توضیح کوتاه برای دسترس‌پذیری و سئو">
              <input name="imageAlt" defaultValue={v.imageAlt} className={field} />
            </Field>
            <Field label="Image alt text (English)">
              <input name="en_imageAlt" dir="ltr" defaultValue={en.imageAlt} className={field} />
            </Field>
          </div>
        </Card>

        <details className="rounded-lg border border-line bg-surface p-5">
          <summary className="cursor-pointer text-sm font-extrabold">تنظیمات پیشرفته</summary>
          <div className="mt-4 space-y-4">
            <Field
              label="نشانی نسخهٔ فارسی (slug)"
              hint="خالی بگذارید تا از عنوان ساخته شود. بهتر است کوتاه باشد."
            >
              <input name="slug" dir="ltr" defaultValue={v.slug} className={field} />
            </Field>
            <Field
              label="English slug"
              hint="خالی بگذارید تا از عنوان انگلیسی ساخته شود."
            >
              <input name="en_slug" dir="ltr" defaultValue={en.slug} className={field} />
            </Field>
          </div>
        </details>

        <div className="flex items-center gap-3">
          <SubmitButton editing={editing} />
          <Link
            href={`/${locale}/admin/articles`}
            className="rounded-md border border-line px-5 py-3 font-bold transition hover:border-accent"
          >
            انصراف
          </Link>
        </div>
      </aside>
    </form>
  );
}