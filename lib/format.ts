const relative = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
const numbers = new Intl.NumberFormat("fa-IR");

export const formatNumber = (value: number) => numbers.format(value);

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  const abs = Math.abs(minutes);
  if (abs < 60) return relative.format(minutes, "minute");
  if (abs < 60 * 24) return relative.format(Math.round(minutes / 60), "hour");
  return relative.format(Math.round(minutes / (60 * 24)), "day");
}
