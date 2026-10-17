import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[50vh] place-content-center justify-items-center gap-4 py-24 text-center">
      <p className="text-h1 font-extrabold text-accent-strong">۴۰۴</p>
      <h1 className="text-h4 font-extrabold">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="max-w-md text-ink-2">ممکن است نشانی را اشتباه وارد کرده باشید یا خبر حذف شده باشد.</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-accent-strong hover:underline underline-offset-4"
      >
        بازگشت به صفحهٔ اصلی
        <ArrowLeft aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
