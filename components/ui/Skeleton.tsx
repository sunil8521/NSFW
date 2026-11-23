export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#1a1a1a] ${className}`}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#141414] flex flex-col h-full">
      <Skeleton className="aspect-[3/4] w-full shrink-0 rounded-none" />
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-2/3 mt-1.5" />
        </div>
        <div className="flex gap-1 h-5 pt-0.5 overflow-hidden">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CarouselSkeleton({ title }: { title?: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {title ? (
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wider text-white font-display whitespace-nowrap">
              {title}
            </h2>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
          <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/60 to-transparent rounded-full hidden sm:block" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[180px] sm:w-[200px] flex flex-col"
          >
            <PostCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
