"use client";

import { LayoutDashboard } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/site";

type MainNavItem = NavItem & { highlight?: boolean };

interface MainNavProps {
  items: MainNavItem[];
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

          if (item.highlight) {
            return (
              <li key={item.href} className={cn(!horizontal && "pt-3 pb-1")}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-base font-bold text-accent-ink transition-opacity hover:opacity-90",
                    horizontal && "w-auto py-2 text-sm",
                  )}
                >
                  <LayoutDashboard aria-hidden className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          }

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