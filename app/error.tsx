"use client";

import { Button } from "./components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[50vh] place-content-center justify-items-center gap-4 py-24 text-center">
      <h1 className="text-h4 font-extrabold">مشکلی پیش آمد</h1>
      <p className="max-w-md text-ink-2">بارگذاری این صفحه با خطا روبه‌رو شد. چند لحظه بعد دوباره تلاش کنید.</p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </div>
  );
}
