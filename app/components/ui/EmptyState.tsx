import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-lg border border-dashed border-line py-16 text-center">
      <Icon aria-hidden className="size-10 text-accent" />
      <h2 className="text-h4 font-extrabold">{title}</h2>
      {description && <p className="max-w-md text-ink-2">{description}</p>}
      {children}
    </div>
  );
}
