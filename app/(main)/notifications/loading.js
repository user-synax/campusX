import NotificationSkeleton from "@/components/notifications/NotificationSkeleton"

export default function NotificationsLoading() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
      </div>
      <div className="divide-y divide-border">
        {Array(10).fill(0).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
