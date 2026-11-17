import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  const navItems: NavItem[] = [
    { label: tNav("home"), href: "/" },
    ...categories.map((c) => ({ label: tCat(c.slug), href: categoryHref(c.slug) })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="container-page flex h-16 items-center gap-6 lg:h-20">
        <Logo />
        <MainNav items={navItems} className="hidden lg:block" />
        <div className="ms-auto flex items-center gap-1">
          <SearchInput id="header-search" className="hidden w-60 xl:flex" />
          <Link href="/search" aria-label={t("search")} className={cn(iconButtonClass, "xl:hidden")}>
            <Search aria-hidden className="size-5" />
          </Link>
          <ThemeToggle />
          <MobileMenu items={navItems} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}