"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import type { LatestFeedState } from "./useLatestFeed";
import { NewsCard } from "./NewsCard";

/** وقتی تا انتهای مسیر کمتر از این مقدار (پیکسل) مانده، صفحه‌ی بعدی خبرها بارگذاری می‌شود. */
const LOAD_AHEAD = 900;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong";

/**
 * حالت «اسکرول عمودی ← حرکت افقی».
 *
 * یک «باند» به‌اندازه‌ی (عرض مسیر + ارتفاع صفحه) داریم و قابِ داخلش با position: sticky ثابت می‌ماند.
 * هر پیکسل اسکرول عمودی، دقیقاً یک پیکسل مسیر کارت‌ها را به چپ می‌برد (دید به‌سمت راست می‌رود).
 * اسکرول خود مرورگر دست‌کاری نمی‌شود؛ پس کیبورد (Space، PageDown، Tab) و صفحه‌خوان سالم می‌مانند.
 * چون نگاشت ۱ به ۱ است، اضافه‌شدن خبر جدید به انتهای مسیر هیچ پرشی ایجاد نمی‌کند.
 */
export function PinnedTrack({ feed, heading }: { feed: LatestFeedState; heading: ReactNode }) {
  const { items, hasMore, loading, error, status, loadMore } = feed;

  const runwayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const maxXRef = useRef(0);
  const [maxX, setMaxX] = useState(0);

  const sync = useCallback(() => {
    const runway = runwayRef.current;
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!runway || !frame || !track) return;

    const max = Math.max(0, track.scrollWidth - frame.clientWidth);
    if (max !== maxXRef.current) {
      maxXRef.current = max;
      setMaxX(max);
    }

    const offset = Math.min(Math.max(-runway.getBoundingClientRect().top, 0), max);
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    if (hasMore && !error && max - offset < LOAD_AHEAD) void loadMore();
  }, [error, hasMore, loadMore]);

  useEffect(() => {
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, items.length, maxX, loading]);

  // وقتی کارتی با Tab فوکوس می‌گیرد، اسکرول صفحه را طوری می‌بریم که همان کارت در دید بیاید.
  const onFocus = (event: FocusEvent<HTMLUListElement>) => {
    const runway = runwayRef.current;
    const item = (event.target as HTMLElement).closest("li");
    if (!runway || !item) return;
    const wanted = Math.min(Math.max(item.offsetLeft - 24, 0), maxXRef.current);
    const runwayTop = runway.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: runwayTop + wanted, behavior: "auto" });
  };

  return (
    <div ref={runwayRef} style={{ height: `calc(100vh + ${maxX}px)` }}>
      <div ref={frameRef} className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {heading}

        <div
          // مرورگر ممکن است برای فوکوس، این ظرف را اسکرول کند؛ همیشه برش می‌دهیم و به صفر برمی‌گردانیم.
          onScroll={(event) => {
            event.currentTarget.scrollLeft = 0;
          }}
          className="overflow-hidden py-2"
        >
          {/* مسیر عمداً LTR است تا دید با اسکرول به‌سمت راست برود؛ متن کارت‌ها همچنان RTL می‌ماند. */}
          <ul ref={trackRef} dir="ltr" onFocus={onFocus} className="relative flex w-full gap-6 will-change-transform">
            {items.map((article) => (
              <li key={article.id} dir="rtl" className="w-[26rem] shrink-0">
                <NewsCard article={article} />
              </li>
            ))}

            {loading && (
              <li aria-hidden="true" className="w-[26rem] shrink-0">
                <div className="h-80 rounded-lg border border-line bg-surface animate-pulse" />
              </li>
            )}

            {error && (
              <li dir="rtl" className="flex w-64 shrink-0 flex-col items-center justify-center gap-3 text-center">
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
          </ul>
        </div>

        <p role="status" className="sr-only">
          {status}
        </p>
      </div>
    </div>
  );
}
