import { siteConfig } from "./site";

export const infoPages = {
  about: {
    title: "دربارهٔ ما",
    paragraphs: [
      `${siteConfig.name} رسانه‌ای مستقل و تحلیلی است که با هدف ارائهٔ اخبار دقیق، گزارش‌های عمیق و نگاهی متفاوت به رویدادهای مهم فعالیت می‌کند.`,
      "ما به دقت، شفافیت منابع و احترام به وقت مخاطب پایبندیم. هر خبر پیش از انتشار بررسی می‌شود و اشتباه‌های احتمالی به‌صورت علنی اصلاح خواهد شد.",
    ],
  },
  contact: {
    title: "تماس با ما",
    paragraphs: [
      `برای ارسال خبر، پیشنهاد همکاری یا گزارش اشتباه، به نشانی ${siteConfig.email} ایمیل بزنید.`,
      "تلاش می‌کنیم پیام‌ها را در کمتر از دو روز کاری پاسخ دهیم.",
    ],
  },
  terms: {
    title: "قوانین و شرایط",
    paragraphs: [
      "استفاده از این سایت به معنی پذیرش قوانین آن است. بازنشر محتوا با ذکر منبع و پیوند به خبر اصلی آزاد است.",
      "نظرها و پیام‌هایی که توهین‌آمیز، تبلیغاتی یا خلاف قانون باشند حذف می‌شوند.",
    ],
  },
  privacy: {
    title: "حریم خصوصی",
    paragraphs: [
      "ایمیل شما فقط برای ارسال خبرنامه نگهداری می‌شود و با هیچ شخص ثالثی به اشتراک گذاشته نمی‌شود.",
      "هر زمان بخواهید می‌توانید با ایمیل به نشانی تماس، حذف اطلاعات خود را درخواست کنید.",
    ],
  },
} as const;

export type InfoSlug = keyof typeof infoPages;
export const infoSlugs = Object.keys(infoPages) as InfoSlug[];
export const isInfoSlug = (value: string): value is InfoSlug => (infoSlugs as string[]).includes(value);
