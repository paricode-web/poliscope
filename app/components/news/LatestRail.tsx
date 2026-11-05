"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { LatestFeedState } from "./useLatestFeed";
import { NewsCard } from "./NewsCard";

interface LatestRailProps {
  feed: LatestFeedState;
  /** شناسه‌ی عنوان بخش، برای نام‌گذاری ناحیه‌ی اسکرول */
  labelledBy: string;
}

const itemWidth = "w-[82%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong";

/** کارت‌های تازه‌رسیده با یک ورود نرم نمایش داده می‌شوند (فقط با motion-safe). */
function Enter({ animate, children }: { animate: boolean; children: ReactNode }) {
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  return (
    <div
      className={`h-full motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out ${
        shown ? "opacity-100" : "motion-safe:translate-y-4 motion-safe:opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function Chevron({ toward }: { toward: "start" | "end" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 rtl:-scale-x-100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={toward === "end" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
    </svg>
  );
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:text-accent-strong aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:text-inherit ${focusRing}`}
    >
      {children}
    </button>
  );
}

/** حالت ساده: ریل افقی با اسکرول/سوایپ بومی. برای موبایل، لمسی، زوم بالا و کاهش حرکت. */
export function LatestRail({ feed, labelledBy }: LatestRailProps) {
  const { items, hasMore, loading, error, status, initialCount, loadMore } = feed;
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const rafRef = useRef(0);

  // وقتی انتهای ریل به دید نزدیک شد، صفحه‌ی بعد بارگذاری می‌شود.
  useEffect(() => {
    const root = railRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasMore || error || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { root, rootMargin: "0px 480px 0px 480px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, error, loading, items.length, loadMore]);

  // در RTL مقدار scrollLeft منفی است؛ برای همین از قدر مطلق استفاده می‌شود.
  const updateEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const position = Math.abs(el.scrollLeft);
    setAtStart(position <= 2);
    setAtEnd(position + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges, items.length]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onScroll = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateEdges);
  };

  /** direction: ‎1 = به‌سمت انتهای فهرست، ‎-1 = به‌سمت ابتدا (مستقل از RTL/LTR) */
  const scrollByPage = (direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.9,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <RailButton label="اخبار قبلی" disabled={atStart} onClick={() => scrollByPage(-1)}>
          <Chevron toward="start" />
        </RailButton>
        <RailButton label="اخبار بعدی" disabled={atEnd && !hasMore} onClick={() => scrollByPage(1)}>
          <Chevron toward="end" />
        </RailButton>
      </div>

      <div
        ref={railRef}
        role="region"
        aria-labelledby={labelledBy}
        tabIndex={0}
        onScroll={onScroll}
        className="snap-x snap-proximity overflow-x-auto overscroll-x-contain pb-4 outline-offset-4 motion-safe:scroll-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-strong"
      >
        <ul className="flex gap-6">
          {items.map((article, index) => (
            <li key={article.id} className={itemWidth}>
              <Enter animate={index >= initialCount}>
                <NewsCard article={article} />
              </Enter>
            </li>
          ))}

          {loading && (
            <li aria-hidden="true" className={itemWidth}>
              <div className="h-full min-h-72 rounded-lg border border-line bg-surface motion-safe:animate-pulse" />
            </li>
          )}

          {error && (
            <li className="flex w-64 shrink-0 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-ink-2">بارگذاری اخبار بیشتر ناموفق بود.</p>
              <button
                type="button"
                onClick={() => void loadMore()}
                className={`inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 text-sm font-bold transition-colors hover:text-accent-strong ${focusRing}`}
              >
                تلاش دوباره
              </button>
            </li>
          )}

          {hasMore && !error && <li ref={sentinelRef} aria-hidden="true" className="w-px shrink-0" />}
        </ul>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  );
}
