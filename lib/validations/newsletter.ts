import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "ایمیل را وارد کنید.")
    .email("ایمیل واردشده معتبر نیست.")
    .max(254, "ایمیل واردشده بیش از حد طولانی است."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
