import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categoryHref } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";

export function CategoryBadge({ slug }: { slug: CategorySlug }) {
  const t = useTranslations("Categories");

  return (
    <Link href={categoryHref(slug)} className="...همان کلاس‌های قبلی...">
      {t(slug)}
    </Link>
  );
}