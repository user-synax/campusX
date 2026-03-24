'use client'

import { useState } from 'react'

export default function BarChart({ data = [], title, rangeLabel, height = 160 }) {
    const [tooltip, setTooltip] = useState(null)

    const isEmpty = !data.length || data.every(d => d.value === 0)
    const maxVal = isEmpty ? 1 : Math.max(...data.map(d => d.value))

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">{title}</span>
                {rangeLabel && (
                    <span className="text-xs text-muted-foreground">{rangeLabel}</span>
                )}
            </div>

            {isEmpty ? (
                <div
                    className="flex items-center justify-center text-muted-foreground text-sm"
                    style={{ height }}
                >
                    No data for this period
                </div>
            ) : (
                <div className="relative" style={{ height }}>
                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            className="absolute z-10 bg-popover border border-border rounded-md px-2 py-1 text-xs pointer-events-none shadow-md"
                            style={{ left: tooltip.x, top: 0, transform: 'translateX(-50%)' }}
                        >
                            <div className="font-medium">{tooltip.label}</div>
                            <div className="text-muted-foreground">{tooltip.value.toLocaleString()}</div>
                        </div>
                    )}

                    {/* Bars */}
                    <div className="flex items-end gap-[2px] h-full">
                        {data.map((d, i) => {
                            const barH = Math.max(2, Math.round((d.value / maxVal) * (height - 24)))
                            return (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                                    onMouseEnter={e => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        const parent = e.currentTarget.parentElement.getBoundingClientRect()
                                        setTooltip({ label: d.label, value: d.value, x: rect.left - parent.left + rect.width / 2 })
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    <div
                                        className="w-full rounded-t-sm bg-primary/70 group-hover:bg-primary transition-colors"
                                        style={{ height: barH }}
                                    />
                                    {data.length <= 14 && (
                                        <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-none">
                                            {d.label?.slice(-5)}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
