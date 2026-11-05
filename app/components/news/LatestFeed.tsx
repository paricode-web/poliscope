"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Article } from "@/lib/types";
import { LatestRail } from "./LatestRail"; 
import { PinnedTrack } from "./PinnedTrack"; 
import { useLatestFeed } from "./useLatestFeed"; 

/**
 * حالت پین‌شده فقط جایی فعال می‌شود که واقعاً مناسب است:
 * صفحه‌ی عریض، ماوس (نه لمس)، و کاربری که حرکت کمتر نخواسته.
 * بقیه (موبایل، زوم بالا، کاهش حرکت، بدون JS) ریل افقی ساده‌ی بومی را می‌بینند.
 */
const PINNED_QUERY = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

interface LatestFeedProps {
  initialArticles: Article[];
  initialHasMore: boolean;
  asOf: string;
  pageSize: number;
  /** شناسه‌ی عنوانی که داخل heading رندر می‌شود */
  labelledBy: string;
  /** عنوان بخش؛ در حالت پین‌شده همراه کارت‌ها ثابت می‌ماند */
  heading: ReactNode;
}

export function LatestFeed({ heading, labelledBy, ...options }: LatestFeedProps) {
  const feed = useLatestFeed(options);
  const pinned = useMediaQuery(PINNED_QUERY);

  if (pinned) return <PinnedTrack feed={feed} heading={heading} />;

  return (
    <>
      {heading}
      <LatestRail feed={feed} labelledBy={labelledBy} />
    </>
  );
}
