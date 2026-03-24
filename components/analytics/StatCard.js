import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getGrowthColorClass } from '@/lib/analytics'

export default function StatCard({ title, value, growth, unit, icon: Icon }) {
    const hasGrowth = growth !== undefined && growth !== null

    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
                    {title}
                </span>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                    </div>
                )}
            </div>

            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold tabular-nums leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
                </span>
                {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
            </div>

            {hasGrowth && (
                <div className={`flex items-center gap-1 text-xs font-medium ${getGrowthColorClass(growth)}`}>
                    {growth > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                    ) : growth < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                    ) : (
                        <Minus className="w-3 h-3" />
                    )}
                    <span>{growth > 0 ? '+' : ''}{growth}% vs prev period</span>
                </div>
            )}
        </div>
    )
}
