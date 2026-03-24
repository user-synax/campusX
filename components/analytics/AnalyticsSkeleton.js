export default function AnalyticsSkeleton() {
    return (
        <div className="animate-pulse space-y-6 p-4">
            {/* Stat cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-20 bg-accent rounded" />
                            <div className="h-8 w-8 bg-accent rounded-lg" />
                        </div>
                        <div className="h-7 w-16 bg-accent rounded" />
                        <div className="h-3 w-24 bg-accent rounded" />
                    </div>
                ))}
            </div>

            {/* Chart placeholder */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="h-4 w-40 bg-accent rounded" />
                <div className="h-40 bg-accent rounded-lg" />
            </div>

            {/* Two column charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <div className="h-4 w-32 bg-accent rounded" />
                        <div className="h-32 bg-accent rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Table placeholder */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="h-4 w-36 bg-accent rounded" />
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="h-3 w-4 bg-accent rounded" />
                        <div className="h-3 flex-1 bg-accent rounded" />
                        <div className="h-3 w-16 bg-accent rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}
