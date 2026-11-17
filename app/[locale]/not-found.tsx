import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-neutral-300">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-bold">صفحه‌ای که دنبالش بودی پیدا نشد</h1>
      <p className="mt-2 text-neutral-600">
        ممکنه آدرس اشتباه باشه یا صفحه حذف شده باشه.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-white"
      >
        بازگشت به صفحه‌ی اصلی
      </Link>
    </main>
  );
}