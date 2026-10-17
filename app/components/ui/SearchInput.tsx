import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  id: string;
  defaultValue?: string;
  size?: "md" | "lg";
  className?: string;
}

export function SearchInput({ id, defaultValue, size = "md", className }: SearchInputProps) {
  return (
    <form
      action="/search"
      role="search"
      className={cn(
        size === "lg" ? "h-12 text-base" : "h-10 text-sm",
        "flex items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-accent-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-strong",
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
        defaultValue={defaultValue}
        type="search"
        placeholder="جستجو در اخبار…"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-2"
      />
    </form>
  );
}
