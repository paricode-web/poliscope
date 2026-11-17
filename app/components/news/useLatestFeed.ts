"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Article } from "@/lib/types";

interface SliceResponse {
  items: Article[];
  hasMore: boolean;
}

interface Options {
  initialArticles: Article[];
  initialHasMore: boolean;
  /** لحظه‌ی رندر صفحه؛ ترتیب صفحه‌های بعدی را ثابت نگه می‌دارد. */
  asOf: string;
  pageSize: number;
}

/** منطق مشترک بارگذاری بی‌نهایت «آخرین اخبار»؛ هم ریل ساده و هم حالت پین‌شده از آن استفاده می‌کنند. */
export function useLatestFeed({ initialArticles, initialHasMore, asOf, pageSize }: Options) {
  const t = useTranslations("Latest");
  const locale = useLocale();

  const [items, setItems] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const loadingRef = useRef(false);
  const offsetRef = useRef(initialArticles.length);
  const idsRef = useRef(new Set(initialArticles.map((article) => article.id)));
  const abortRef = useRef<AbortController | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams({
        offset: String(offsetRef.current),
        limit: String(pageSize),
        asOf,
        locale,
      });
      const response = await fetch(`/api/news/latest?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as SliceResponse;
      offsetRef.current += data.items.length;

      const fresh = data.items.filter((article) => !idsRef.current.has(article.id));
      fresh.forEach((article) => idsRef.current.add(article.id));

      setItems((previous) => [...previous, ...fresh]);
      setHasMore(data.hasMore);
      setAnnouncement(
        fresh.length > 0
          ? `${t("added", { count: fresh.length, total: idsRef.current.size })}${
              data.hasMore ? "" : ` ${t("end")}`
            }`
          : t("noMore"),
      );
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [asOf, hasMore, pageSize, locale, t]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const status = loading ? t("statusLoading") : error ? t("statusError") : announcement;

  return { items, hasMore, loading, error, status, initialCount: initialArticles.length, loadMore };
}

export type LatestFeedState = ReturnType<typeof useLatestFeed>;
