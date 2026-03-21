import PostSkeleton from "@/components/post/PostSkeleton"

export default function BookmarksLoading() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <h1 className="text-xl font-bold tracking-tight">Bookmarks</h1>
      </div>
      <div className="divide-y divide-border">
        {Array(5).fill(0).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
