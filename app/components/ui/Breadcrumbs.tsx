import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex min-w-0 items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-accent-strong hover:underline underline-offset-4">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[32ch] truncate font-medium text-ink">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronLeft aria-hidden className="size-4 shrink-0" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
