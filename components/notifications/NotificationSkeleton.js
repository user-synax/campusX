import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-border animate-pulse">
      <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-4 w-48 bg-secondary" />
          <Skeleton className="h-2 w-2 rounded-full bg-secondary" />
        </div>
        <Skeleton className="h-3 w-24 bg-secondary" />
      </div>
      <Skeleton className="w-4 h-4 bg-secondary" />
    </div>
  )
}
