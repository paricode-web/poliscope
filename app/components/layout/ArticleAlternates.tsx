"use client";

import { useEffect, useSyncExternalStore } from "react";

/** slug نسخه‌های منتشرشدهٔ خبر در هر زبان. */
export type Alternates = Partial<Record<"fa" | "en", string>>;

type Entry = { alternates: Alternates };

/**
 * Header بالاتر از صفحه رندر می‌شود و context از صفحه به آن نمی‌رسد؛
 * پس صفحهٔ خبر آدرس ترجمه‌ها را اینجا ثبت می‌کند و سوییچر زبان از همین‌جا می‌خواند.
 */
let current: Entry | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** null یعنی صفحهٔ فعلی صفحهٔ خبر نیست. */
export function useArticleAlternates(): Entry | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

/** داخل صفحهٔ خبر قرار می‌گیرد و چیزی رندر نمی‌کند. */
export function ArticleAlternates({ alternates }: { alternates: Alternates }) {
  const { fa, en } = alternates;

  useEffect(() => {
    const entry: Entry = { alternates: { fa, en } };
    current = entry;
    emit();
    return () => {
      if (current === entry) {
        current = null;
        emit();
      }
    };
  }, [fa, en]);

  return null;
}
