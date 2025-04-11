import { Skeleton } from '@heroui/react';

interface SkeletonPluginGridProps {
  count?: number;
}

export const SkeletonPluginGrid = ({ count = 6 }: SkeletonPluginGridProps) => {
  return (
    <div className="u-grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-span-12 md:col-span-6 xl:col-span-4">
          <div className="h-full border border-foreground/10 bg-background/30 p-5 shadow-md">
            <div className="flex flex-col gap-3">
              {/* Image placeholder */}
              <Skeleton className="h-40 w-full rounded-none">
                <div className="h-40 w-full bg-foreground/5" />
              </Skeleton>

              {/* Title placeholder */}
              <Skeleton className="h-6 w-3/4 rounded-none">
                <div className="h-6 w-full bg-foreground/5" />
              </Skeleton>

              {/* Description placeholder */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-none">
                  <div className="h-4 w-full bg-foreground/5" />
                </Skeleton>
                <Skeleton className="h-4 w-5/6 rounded-none">
                  <div className="h-4 w-full bg-foreground/5" />
                </Skeleton>
              </div>

              {/* Tags/metadata placeholder */}
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-none">
                  <div className="h-6 w-16 bg-foreground/5" />
                </Skeleton>
                <Skeleton className="h-6 w-16 rounded-none">
                  <div className="h-6 w-16 bg-foreground/5" />
                </Skeleton>
              </div>

              {/* Author/stats placeholder */}
              <div className="mt-2 flex justify-between">
                <Skeleton className="h-5 w-1/3 rounded-none">
                  <div className="h-5 w-full bg-foreground/5" />
                </Skeleton>
                <Skeleton className="h-5 w-1/4 rounded-none">
                  <div className="h-5 w-full bg-foreground/5" />
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
