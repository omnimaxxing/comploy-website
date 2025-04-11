import { Skeleton } from '@heroui/react';

interface SkeletonShowcaseGridProps {
  count?: number;
}

export const SkeletonShowcaseGrid = ({ count = 6 }: SkeletonShowcaseGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-item-${index}`}
          className="flex flex-col overflow-hidden rounded-lg will-change-transform"
        >
          {/* Image container skeleton */}
          <div className="relative aspect-[4/3] w-full bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10" />

            {/* Title and views skeleton */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
                <Skeleton className="mb-2 h-6 w-3/4">
                  <div className="h-6 w-full rounded-md bg-white/10" />
                </Skeleton>

                <div className="flex items-center gap-1">
                  <Skeleton className="h-6 w-8 rounded-full">
                    <div className="h-6 w-8 rounded-full bg-white/10" />
                  </Skeleton>
                  <Skeleton className="h-4 w-12">
                    <div className="h-4 w-12 rounded-md bg-white/10" />
                  </Skeleton>
                </div>
              </div>
            </div>
          </div>

          {/* Tags and actions skeleton */}
          <div className="flex items-center justify-between border-t border-white/5 p-3">
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-14">
                <div className="h-5 w-14 rounded-sm bg-white/10" />
              </Skeleton>
              <Skeleton className="h-5 w-16">
                <div className="h-5 w-16 rounded-sm bg-white/10" />
              </Skeleton>
            </div>

            <div className="ml-auto flex gap-1">
              <Skeleton className="h-6 w-14">
                <div className="h-6 w-14 rounded-sm bg-white/10" />
              </Skeleton>
              <Skeleton className="h-6 w-14">
                <div className="h-6 w-14 rounded-sm bg-white/10" />
              </Skeleton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
