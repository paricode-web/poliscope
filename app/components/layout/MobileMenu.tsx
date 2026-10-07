"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { iconButtonClass } from "@/components/ui/styles";
import type { NavItem } from "@/lib/site";
import { MainNav } from "./MainNav";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        onClick={() => setOpen((value) => !value)}
        className={iconButtonClass}
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>
      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-canvas">
          <div className="container-page py-2">
            <MainNav items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
