import { GridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Trending section skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[200px]">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <div className="mt-2 space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-36" />
        <GridSkeleton count={15} />
      </div>
    </div>
  );
}
