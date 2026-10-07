import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function SearchInput({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action="/search"
      role="search"
      className={cn(
        "flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-accent-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-strong",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        جستجو در سایت
      </label>
      <Search aria-hidden className="size-4 shrink-0 text-ink-2" />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="جستجو در اخبار…"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-2"
      />
    </form>
  );
}
