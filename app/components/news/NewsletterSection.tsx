import { NewsletterForm } from "./NewsletterForm";

export function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="grid gap-8 rounded-lg border border-line bg-canvas-2 p-8 md:grid-cols-2 md:items-center md:p-12"
    >
      <div>
        <h2 id="newsletter-heading" className="text-h4 font-extrabold md:text-h3">
          هر صبح، مهم‌ترین اخبار در ایمیل شما
        </h2>
        <p className="mt-3 text-ink-2">با عضویت در خبرنامهٔ روزانه، گزیدهٔ خبرها و تحلیل‌ها را دریافت کنید.</p>
      </div>
      <NewsletterForm />
    </section>
  );
}
