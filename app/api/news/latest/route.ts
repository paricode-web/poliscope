import { getLatestSlice, LATEST_PAGE_SIZE } from "@/lib/news";

const MAX_LIMIT = 12;
/** سقف تعداد خبرهایی که ریل می‌تواند پشت‌سرهم بارگذاری کند (محافظ دیتابیس و حافظه‌ی مرورگر). */
const MAX_OFFSET = 240;

function intParam(value: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = intParam(searchParams.get("limit"), LATEST_PAGE_SIZE, 1, MAX_LIMIT);
  const offset = intParam(searchParams.get("offset"), 0, 0, MAX_OFFSET);

  // asOf لحظه‌ی رندر صفحه است؛ با آن، انتشار خبر جدید ترتیب صفحه‌های بعدی را به‌هم نمی‌زند.
  const now = new Date();
  const parsed = new Date(searchParams.get("asOf") ?? "");
  const hasValidAsOf = !Number.isNaN(parsed.getTime()) && parsed <= now;
  const asOf = hasValidAsOf ? parsed : now;

  try {
    const { items, hasMore } = await getLatestSlice(offset, limit, asOf);
    return Response.json(
      { items, hasMore: hasMore && offset + items.length < MAX_OFFSET },
      {
        headers: {
          // فقط وقتی asOf ثابت است، پاسخ قابل کش است.
          "Cache-Control": hasValidAsOf
            ? "public, s-maxage=300, stale-while-revalidate=600"
            : "no-store",
        },
      },
    );
  } catch {
    return Response.json({ error: "failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
