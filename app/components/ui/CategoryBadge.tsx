import Link from "next/link";
import { categoryHref, getCategory } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";

export function CategoryBadge({ slug }: { slug: CategorySlug }) {
  return (
    <Link
      href={categoryHref(slug)}
      className="inline-flex items-center gap-2 text-sm font-bold text-accent-strong hover:underline underline-offset-4"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {getCategory(slug).name}
    </Link>
  );
}
