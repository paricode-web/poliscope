"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { newsletterSchema } from "@/lib/validations/newsletter";

export function NewsletterForm() {
  const t = useTranslations("Newsletter");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = newsletterSchema.safeParse({ email: String(new FormData(form).get("email") ?? "") });
    if (!parsed.success) {
      setError(t("invalidEmail"));
      return;
    }

    setError(null);
    setPending(true);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }).catch(() => null);
    setPending(false);

    if (response?.ok) {
      toast.success(t("success"));
      form.reset();
    } else {
      toast.error(t("genericError"));
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-12 min-w-0 flex-1 rounded-md border border-line bg-surface px-4 text-ink placeholder:text-ink-2 ltr:text-left rtl:text-right aria-[invalid=true]:border-accent-strong"
        />
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />}
          {pending ? t("pending") : t("submit")}
        </Button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="mt-2 text-sm font-medium text-accent-strong">
          {error}
        </p>
      )}
    </form>
  );
}
