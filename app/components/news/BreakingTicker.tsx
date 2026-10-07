"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TickerItem {
  id: string;
  title: string;
  href: string;
  time: string;
}

const ROTATE_MS = 6000;
const controlClass =
  "inline-flex size-8 items-center justify-center rounded-sm hover:bg-black/15 focus-visible:outline-accent-ink";

export function BreakingTicker({ items }: { items: TickerItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  const item = items[index];
  if (!item) return null;

  const step = (direction: 1 | -1) => setIndex((i) => (i + direction + items.length) % items.length);

  return (
    <div
      role="region"
      aria-label="خبر فوری"
      className="bg-accent-strong text-accent-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-page flex h-11 items-center gap-3">
        <span className="shrink-0 rounded-sm bg-canvas px-3 py-0.5 text-sm font-extrabold text-accent-strong">
          خبر فوری
        </span>
        <p className="min-w-0 flex-1 truncate text-sm md:text-base">
          <Link href={item.href} className="underline-offset-4 hover:underline focus-visible:outline-accent-ink">
            {item.title}
          </Link>
        </p>
        <span className="hidden shrink-0 text-sm opacity-90 sm:inline">{item.time}</span>
        {items.length > 1 && (
          <div className="flex shrink-0 items-center">
            <button type="button" aria-label="خبر قبلی" onClick={() => step(-1)} className={controlClass}>
              <ChevronRight aria-hidden className="size-4" />
            </button>
            <button type="button" aria-label="خبر بعدی" onClick={() => step(1)} className={controlClass}>
              <ChevronLeft aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
