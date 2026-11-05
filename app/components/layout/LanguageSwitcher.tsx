"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation"
import { iconButtonClass } from "../ui/styles";
import { cn } from "@/lib/cn";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const next = locale === "fa" ? "en" : "fa";

  return (
    <button
      type="button"
      disabled={pending}
      lang={next}
      aria-label={t("switchLanguage")}
      onClick={() => startTransition(() => router.replace(pathname, { locale: next }))}
      className={cn(iconButtonClass, "w-auto gap-1.5 px-2.5 text-sm font-medium")}
    >
      <Languages aria-hidden className="size-5" />
      <span>{next === "en" ? "EN" : "فا"}</span>
    </button>
  );
}