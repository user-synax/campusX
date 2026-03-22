import { Skeleton } from "@/components/ui/skeleton" 
 
export default function NotificationItemSkeleton() { 
  return ( 
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border/50"> 
      <Skeleton className="w-10 h-10 rounded-full shrink-0" /> 
      <div className="flex-1 space-y-2"> 
        <Skeleton className="h-3.5 w-4/5" /> 
        <Skeleton className="h-3 w-2/5" /> 
      </div> 
    </div> 
  ) 
} 
