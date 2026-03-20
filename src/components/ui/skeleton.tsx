import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-[1rem] bg-latik/10", className)} />;
}

export function MenuItemSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-latik/18 bg-asukal/92 shadow-[0_14px_28px_rgba(59,31,14,0.10)]">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-[1.35rem] border border-latik/18 bg-asukal/92 p-6 shadow-[0_14px_28px_rgba(59,31,14,0.10)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
