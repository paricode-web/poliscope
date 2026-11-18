"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { articleHref } from "@/lib/site";
import { useArticleAlternates } from "./ArticleAlternates";

const LANGUAGES = [
  { code: "fa", label: "فارسی", short: "فا" },
  { code: "en", label: "English", short: "EN" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Header");
  const pathname = usePathname();
  const article = useArticleAlternates();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  // بستن منو با کلیک بیرون یا زدن Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("switchLanguage")}
        title={t("switchLanguage")}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line px-2.5 text-sm font-bold transition hover:border-accent hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
        </svg>
        <span>{current.short}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === locale;

            // در صفحهٔ خبر، مقصد همان خبر در زبان دیگر است، نه آدرس فعلی.
            const translatedSlug = article?.alternates[lang.code];

            if (article && !translatedSlug) {
              return (
                <li key={lang.code} role="none">
                  <span
                    role="menuitem"
                    aria-disabled="true"
                    title={t("languageUnavailable")}
                    className="flex cursor-not-allowed items-center justify-between gap-3 px-3 py-2 text-sm opacity-50"
                  >
                    <span>{lang.label}</span>
                    <span className="text-caption">{t("languageUnavailableShort")}</span>
                  </span>
                </li>
              );
            }

            const href = article && translatedSlug ? articleHref({ slug: translatedSlug }) : pathname;

            return (
              <li key={lang.code} role="none">
                <Link
                  role="menuitem"
                  href={href}
                  locale={lang.code}
                  lang={lang.code}
                  hrefLang={lang.code}
                  prefetch={false}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition hover:bg-black/5 ${
                    active ? "font-bold text-accent-strong" : ""
                  }`}
                >
                  <span>{lang.label}</span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}