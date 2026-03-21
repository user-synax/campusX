import { Skeleton } from "@/components/ui/skeleton"

export default function CommunityLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10 flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* List of Communities */}
        <div className="grid gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-xl">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
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
