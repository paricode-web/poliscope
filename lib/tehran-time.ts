/** ایران از ۱۴۰۱ ساعت تابستانی ندارد؛ پس افست ثابت UTC+03:30 است. */
const OFFSET_MS = 3.5 * 60 * 60 * 1000;

/** مقدار datetime-local مثل "2026-10-13T10:30" را به وقت تهران تفسیر می‌کند، نه وقت سرور. */
export const parseTehranLocal = (value: string) => new Date(`${value}:00+03:30`);

/** برعکس تابع بالا؛ برای پرکردن فیلد datetime-local در فرم ویرایش. */
export const toTehranLocalInput = (date: Date) =>
  new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 16);
