"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/site";
interface MainNavProps {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  onNavigate?: () => void;
}

export function MainNav({ items, orientation = "horizontal", className, onNavigate }: MainNavProps) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";
const t = useTranslations("Footer");
  return (
    <nav aria-label={t("categories")} className={className}>
      <ul className={cn("flex", horizontal ? "items-center gap-1" : "flex-col")}>
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block text-sm transition-colors hover:text-accent-strong",
                  horizontal ? "px-3 py-2" : "border-b border-line py-3 text-base",
                  active ? "font-bold text-accent-strong" : "font-medium text-ink-2",
                  active && horizontal && "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-accent",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
