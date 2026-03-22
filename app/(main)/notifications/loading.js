import { Skeleton } from "@/components/ui/skeleton" 
import NotificationItemSkeleton from "@/components/notifications/NotificationItemSkeleton" 
 
export default function NotificationsLoading() { 
  return ( 
    <div className="flex flex-col min-h-screen"> 
      {/* Header skeleton */} 
      <div className="border-b p-4 flex justify-between items-center bg-background/50 backdrop-blur sticky top-0 z-10"> 
        <Skeleton className="h-7 w-32" /> 
        <Skeleton className="h-5 w-24" /> 
      </div> 
 
      {/* Tab skeleton */} 
      <div className="border-b flex"> 
        <div className="flex-1 p-2.5 flex justify-center border-b-2 border-primary/20">
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex-1 p-2.5 flex justify-center">
          <Skeleton className="h-4 w-12" />
        </div>
      </div> 
 
      {/* Date group skeleton */}
      <div className="px-4 py-2 bg-accent/30 border-b border-border/50">
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Notification skeletons */} 
      <div className="divide-y divide-border/30">
        {Array(8).fill(0).map((_, i) => ( 
          <NotificationItemSkeleton key={i} /> 
        ))} 
      </div>
    </div> 
  ) 
} 
