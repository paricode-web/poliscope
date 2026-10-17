import { z } from "zod";

/** پارامترهای نامعتبر آدرس به مقدار امن برمی‌گردند و خطا نمی‌دهند. */
export const pageSchema = z.coerce.number().int().min(1).max(500).catch(1);
export const searchQuerySchema = z.string().trim().max(100).catch("");
