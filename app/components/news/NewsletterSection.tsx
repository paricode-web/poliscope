import { useTranslations } from "next-intl";
import { NewsletterForm } from "./NewsletterForm";

export function NewsletterSection() {
  const t = useTranslations("Newsletter");

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="grid gap-8 rounded-lg border border-line bg-canvas-2 p-8 md:grid-cols-2 md:items-center md:p-12"
    >
      <div>
        <h2 id="newsletter-heading" className="text-h4 font-extrabold md:text-h3">
          {t("title")}
        </h2>
        <p className="mt-3 text-ink-2">{t("description")}</p>
      </div>
      <NewsletterForm />
    </section>
  );
}
