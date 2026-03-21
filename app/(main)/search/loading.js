import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <div className="w-full h-10 bg-accent/20 rounded-md border border-border" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3 py-4 border-b border-border last:border-0">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
