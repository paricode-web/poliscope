"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealState = "idle" | "hidden" | "shown";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** تأخیر انیمیشن بر حسب میلی‌ثانیه */
  delay?: number;
}

/**
 * با اسکرول عمودی، محتوا نرم وارد می‌شود (محو + کمی حرکت به بالا).
 *
 * - بدون جاوااسکریپت (و در رندر سرور) محتوا کاملاً دیده می‌شود.
 * - با prefers-reduced-motion هیچ حرکتی اعمال نمی‌شود.
 * - اگر فوکوس کیبورد وارد بخش شود، فوراً نمایان می‌شود.
 */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // بخش‌هایی که از همان ابتدا در دید هستند، بدون انیمیشن نمایش داده می‌شوند.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setState("shown");
      return;
    }

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = state === "hidden";

  return (
    <Tag
      ref={ref}
      onFocusCapture={() => setState("shown")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${className} motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
        hidden ? "motion-safe:translate-y-10 motion-safe:opacity-0" : "opacity-100"
      }`}
    >
      {children}
    </Tag>
  );
}
