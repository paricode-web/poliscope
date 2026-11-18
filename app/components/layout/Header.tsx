import { LayoutDashboard, Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { SearchInput } from "../ui/SearchInput";
import { iconButtonClass } from "../ui/styles";
import { cn } from "@/lib/cn";
import { categories, categoryHref, type NavItem } from "@/lib/site";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Header() {
  const t = await getTranslations("Header");
  const tNav = await getTranslations("Nav");
  const tCat = await getTranslations("Categories");
  const locale = await getLocale();

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const adminLabel = locale === "fa" ? "پنل ادمین" : "Admin panel";

  const navItems: NavItem[] = [
    { label: tNav("home"), href: "/" },
    ...categories.map((c) => ({ label: tCat(c.slug), href: categoryHref(c.slug) })),
  ];

  // در منوی موبایل، آیتم پنل ادمین آخر لیست می‌آید
const mobileItems = isAdmin
  ? [...navItems, { label: adminLabel, href: "/admin", highlight: true }]
  : navItems;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas pt-[env(safe-area-inset-top)]">
      <div className="container-page relative flex h-14 items-center gap-2 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:h-20">
        <Logo />

        <MainNav items={navItems} className="hidden lg:block" />

        <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="me-2 hidden items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm font-medium transition-colors hover:text-accent-strong lg:inline-flex"
            >
              <LayoutDashboard aria-hidden className="size-4" />
              {adminLabel}
            </Link>
          )}

          <SearchInput id="header-search" className="hidden w-60 xl:flex" />

          <Link
            href="/search"
            aria-label={t("search")}
            className={cn(iconButtonClass, "xl:hidden")}
          >
            <Search aria-hidden className="size-5" />
          </Link>

          <ThemeToggle />
          <MobileMenu items={mobileItems} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}