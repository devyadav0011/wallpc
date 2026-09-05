export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60"
          >
            <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-3.5 space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="flex justify-between">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
