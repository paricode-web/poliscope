"use client";

import { Moon, Sun } from "lucide-react";
import { iconButtonClass } from "@/components/ui/styles";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* حالت خصوصی مرورگر؛ تغییر فقط برای همین بازدید می‌ماند */
    }
  }

  return (
    <button type="button" onClick={toggle} aria-label="تغییر پوستهٔ روشن و تیره" className={iconButtonClass}>
      <Moon aria-hidden className="size-5 dark:hidden" />
      <Sun aria-hidden className="hidden size-5 dark:block" />
    </button>
  );
}
