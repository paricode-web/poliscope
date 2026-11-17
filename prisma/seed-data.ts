import type { CategorySlug } from "../lib/types";

export interface SeedArticle {
  slug: string;
  category: CategorySlug;
  title: string;
  summary: string;
  minutesAgo: number;
  readMinutes: number;
  isBreaking?: boolean;
  featuredRank?: number;

  en?: {
    title: string;
    summary: string;
  };
}

function article(
  slug: string,
  category: CategorySlug,
  title: string,
  summary: string,
  minutesAgo: number,
  extra: Partial<SeedArticle> = {},
): SeedArticle {
  return { slug, category, title, summary, minutesAgo, readMinutes: 5, ...extra };
}

/** دادهٔ نمونه برای seed؛ متن‌ها قابل‌جایگزینی با خبر واقعی‌اند. */
export const seedArticles: SeedArticle[] = [
  article("mid-cities-labour-market", "economy", "پس از یک دهه نوسان؛ بازار کار شهرهای میانی چگونه بازتعریف می‌شود", "از کارگاه‌های کوچک تا شرکت‌های دانش‌بنیان، جابه‌جایی سرمایه و نیروی کار الگوی تازه‌ای ساخته است. گزارش ما این تغییر را در شش استان دنبال می‌کند.", 20, { readMinutes: 11, featuredRank: 1 }),
  article("persian-language-models", "technology", "مدل‌های زبانی فارسی؛ از دقت واژه تا درک لحن", "پژوهشگران می‌گویند چالش اصلی داده نیست، تنوع گویش‌هاست.", 60, { featuredRank: 2 }),
  article("autumn-climate-summit", "world", "نشست اقلیمی پاییز؛ توافق‌های کوچک، نتیجه‌های بزرگ‌تر", "مذاکره‌کنندگان از رویکرد تازهٔ تعهدهای مرحله‌ای خبر می‌دهند.", 120, { featuredRank: 3 }),
  article("independent-bookshops", "culture", "بازگشت کتابفروشی‌های مستقل به خیابان‌های قدیمی", "خوانندگان جوان به دنبال مکانی برای خواندن‌اند، نه فقط خریدن.", 180, { featuredRank: 4 }),
  article("transport-plan-vote", "politics", "شورای شهر دربارهٔ طرح تازهٔ حمل‌ونقل عمومی رأی‌گیری می‌کند", "رأی‌گیری امروز با حضور کارشناسان برگزار می‌شود.", 5, { isBreaking: true }),
  article("budget-bill-subsidies", "politics", "لایحهٔ بودجه با تغییرهایی در بخش یارانه‌ها به صحن رسید", "نمایندگان دربارهٔ سازوکار تازهٔ پرداخت یارانه گفت‌وگو کردند.", 90),
  article("local-councils-role", "politics", "بررسی نقش شوراها در تصمیم‌گیری محلی", "تحلیلی از اختیارهای واقعی شوراها در شهرهای کوچک.", 300),
  article("regional-talks", "world", "گفت‌وگوهای منطقه‌ای وارد دور تازه‌ای شد", "هیئت‌ها بر سر دستور کار نشست آینده به توافق رسیدند.", 30),
  article("european-local-elections", "world", "انتخابات محلی در اروپا؛ رأی‌دهندگان به چه چیز فکر می‌کنند؟", "هزینهٔ زندگی مهم‌ترین موضوع رأی‌دهندگان است.", 240),
  article("asia-labour-market", "world", "بازار کار آسیا پس از رشد کند", "موج تازهٔ استخدام در بخش خدمات آغاز شده است.", 420),
  article("central-bank-inflation", "economy", "بانک مرکزی گزارش تازهٔ تورم ماهانه را منتشر کرد", "نرخ تورم نقطه‌ای در ماه گذشته کاهش یافت.", 12, { isBreaking: true }),
  article("non-oil-exports", "economy", "صادرات غیرنفتی در فصل جاری چه تغییری کرد", "سهم کالاهای صنعتی از سبد صادرات بیشتر شد.", 150),
  article("solar-investment", "economy", "سرمایه‌گذاری در انرژی خورشیدی شتاب گرفت", "سرمایه‌گذاران خصوصی نیروگاه‌های کوچک را هدف گرفته‌اند.", 360),
  article("small-business-data-security", "technology", "امنیت داده در شرکت‌های کوچک؛ سه اشتباه رایج", "بیشتر نفوذها از ساده‌ترین خطاها آغاز می‌شود.", 135),
  article("solid-state-batteries", "technology", "نسل تازهٔ باتری‌های حالت جامد به کجا رسید", "آزمایش‌های میدانی نتایج امیدوارکننده‌ای نشان می‌دهد.", 270),
  article("ai-in-education", "technology", "هوش مصنوعی در آموزش؛ فرصت یا نگرانی؟", "معلمان از تجربهٔ نخست خود در کلاس می‌گویند.", 480),
  article("short-film-festival", "culture", "جشنوارهٔ فیلم کوتاه با رکورد ثبت‌نام آغاز شد", "بیش از هزار اثر به دبیرخانه رسیده است.", 165),
  article("contemporary-poetry", "culture", "شعر معاصر و خوانندگان تازه", "شبکه‌های اجتماعی مخاطب شعر را تغییر داده‌اند.", 330),
  article("old-cinema-restoration", "culture", "بازسازی یک سینمای قدیمی در مرکز شهر", "ساختمان دهه‌ها بعد دوباره به روی مخاطبان باز می‌شود.", 500),
  article("research-satellite-launch", "science", "پرتاب موفق ماهوارهٔ پژوهشی؛ داده‌ها تا شب دریافت می‌شود", "ماهواره پس از ورود به مدار پیام اولیه را ارسال کرد.", 28, { isBreaking: true }),
  article("hyrcanian-frog", "science", "کشف گونه‌ای تازه از قورباغه در جنگل‌های هیرکانی", "زیست‌شناسان گونه را از روی صدا و ریخت‌شناسی شناسایی کردند.", 45),
  article("sleep-and-memory", "science", "پژوهش تازه دربارهٔ خواب و حافظهٔ کوتاه‌مدت", "کم‌خوابی یک شب هم عملکرد حافظه را کاهش می‌دهد.", 210),
];
