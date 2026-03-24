'use client'

const COLORS = [
    '#6366f1', '#22d3ee', '#f59e0b', '#10b981',
    '#f43f5e', '#8b5cf6', '#14b8a6', '#fb923c',
]

export default function DonutChart({ data = [], title }) {
    const isEmpty = !data.length || data.every(d => d.value === 0)
    const total = data.reduce((s, d) => s + d.value, 0)

    const SIZE = 120
    const STROKE = 22
    const R = (SIZE - STROKE) / 2
    const CIRC = 2 * Math.PI * R
    const cx = SIZE / 2
    const cy = SIZE / 2

    // Build segments
    let offset = 0
    const segments = data.map((d, i) => {
        const pct = total === 0 ? 0 : d.value / total
        const dash = pct * CIRC
        const seg = { ...d, dash, gap: CIRC - dash, offset, color: d.color || COLORS[i % COLORS.length] }
        offset += dash
        return seg
    })

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <span className="text-sm font-semibold block mb-4">{title}</span>

            {isEmpty ? (
                <div className="flex items-center justify-center text-muted-foreground text-sm h-24">
                    No data for this period
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* SVG Donut */}
                    <svg width={SIZE} height={SIZE} className="shrink-0 -rotate-90">
                        {/* Background track */}
                        <circle
                            cx={cx} cy={cy} r={R}
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth={STROKE}
                        />
                        {segments.map((seg, i) => (
                            <circle
                                key={i}
                                cx={cx} cy={cy} r={R}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={STROKE}
                                strokeDasharray={`${seg.dash} ${seg.gap}`}
                                strokeDashoffset={-seg.offset}
                                strokeLinecap="butt"
                            />
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        {segments.map((seg, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: seg.color }}
                                />
                                <span className="truncate text-muted-foreground flex-1">{seg.label}</span>
                                <span className="font-medium tabular-nums shrink-0">
                                    {seg.value.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground shrink-0">
                                    ({total > 0 ? Math.round((seg.value / total) * 100) : 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
