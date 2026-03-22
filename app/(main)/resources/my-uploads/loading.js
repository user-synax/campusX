export default function MyUploadsLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-1 mb-6">
        <div className="h-6 w-32 bg-accent/20 rounded animate-pulse" />
        <div className="h-4 w-48 bg-accent/10 rounded animate-pulse" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 w-full bg-accent/5 border border-border/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
