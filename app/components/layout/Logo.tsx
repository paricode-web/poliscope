import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name}، صفحهٔ اصلی`}>
      <span aria-hidden className="h-9 w-1.5 bg-accent" />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold">{siteConfig.name}</span>
        <span className="mt-1.5 text-caption text-ink-2">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}
