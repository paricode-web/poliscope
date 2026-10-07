import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ArticleImage } from "@/lib/types";

interface CoverImageProps {
  image?: ArticleImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** ظرف تصویر؛ نسبت ابعاد را با className تعیین کنید. بدون تصویر، جایگاه خنثی نمایش می‌دهد. */
export function CoverImage({ image, sizes, priority = false, className }: CoverImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-canvas-2", className)}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-accent-soft">
          <ImageIcon aria-hidden className="size-10" />
        </div>
      )}
    </div>
  );
}
