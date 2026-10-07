import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SectionHeaderProps {
  id: string;
  title: string;
  href?: string;
}

export function SectionHeader({ id, title, href }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
      <h2 id={id} className="border-s-4 border-accent ps-3 text-h4 font-extrabold md:text-h3">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-accent-strong hover:underline underline-offset-4"
        >
          مشاهدهٔ همه
          <ArrowLeft aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
