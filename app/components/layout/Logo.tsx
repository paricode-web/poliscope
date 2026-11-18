import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("Site");
  const tNav = useTranslations("Nav");

  return (
   <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label={`${t("name")} – ${tNav("home")}`}>
  <span aria-hidden className="h-7 w-1.5 shrink-0 bg-accent sm:h-9" />
  <span className="flex min-w-0 flex-col leading-none">
    <span className="truncate text-lg font-extrabold sm:text-2xl">{t("name")}</span>
    <span className="mt-1 hidden truncate text-caption text-ink-2 min-[400px]:block sm:mt-1.5">{t("tagline")}</span>
  </span>
</Link>
  );
}