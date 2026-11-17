import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("Site");
  const tNav = useTranslations("Nav");

  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${t("name")} – ${tNav("home")}`}>
      <span aria-hidden className="h-9 w-1.5 bg-accent" />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold">{t("name")}</span>
        <span className="mt-1.5 text-caption text-ink-2">{t("tagline")}</span>
      </span>
    </Link>
  );
}