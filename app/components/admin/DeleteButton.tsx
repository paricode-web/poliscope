"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteArticle } from "@/lib/actions/article-actions"; 

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent-strong px-4 py-2 text-sm font-bold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "در حال حذف…" : "بله، حذف شود"}
    </button>
  );
}

export function DeleteButton({
  slug,
  title,
  locale,
}: {
  slug: string;
  title: string;
  locale: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-accent-strong transition hover:bg-accent-soft"
      >
        حذف
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-title" className="border-s-4 border-accent ps-3 text-h4 font-extrabold">
              حذف این مورد؟
            </h2>
            <p className="mt-3 text-ink-2">
              «{title}» برای همیشه حذف می‌شود و قابل بازگشت نیست.
            </p>
            <form action={deleteArticle} className="mt-6 flex items-center gap-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="locale" value={locale} />
              <ConfirmButton />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-line px-4 py-2 text-sm font-bold transition hover:border-accent"
              >
                انصراف
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}