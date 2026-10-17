export default function Loading() {
  return (
    <div role="status" className="container-page py-10 lg:py-14">
      <span className="sr-only">در حال بارگذاری…</span>
      <div className="h-9 w-48 rounded-md bg-canvas-2 motion-safe:animate-pulse" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="aspect-[3/2] bg-canvas-2 motion-safe:animate-pulse" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-16 rounded-sm bg-canvas-2" />
              <div className="h-5 rounded-sm bg-canvas-2" />
              <div className="h-5 w-2/3 rounded-sm bg-canvas-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
