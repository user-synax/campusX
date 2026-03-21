import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10 flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="p-4 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>

        {/* List of Events */}
        <div className="grid gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-xl space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="w-16 h-16 rounded-lg shrink-0 ml-4" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex -space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                  <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                  <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                </div>
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
