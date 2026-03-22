import ResourceSkeleton from "@/components/resources/ResourceSkeleton"

export default function ResourcesLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-20 w-full bg-accent/20 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <ResourceSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
