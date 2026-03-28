'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { format, subDays, eachDayOfInterval, startOfWeek } from 'date-fns'

const WEEKS = 53
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getLevel(count) {
  if (!count) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

// B&W theme — dark bg, white = max activity
const LEVEL_BG = [
  'bg-neutral-800/60',   // 0 empty
  'bg-neutral-600',      // 1
  'bg-neutral-400',      // 2
  'bg-neutral-200',      // 3
  'bg-white',            // 4 max
]

export default function ActivityHeatmap({ username }) {
  const [activityMap, setActivityMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState(null) // { date, count, cellIndex }
  const containerRef = useRef(null)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    fetch(`/api/users/${username}/activity`)
      .then(r => r.json())
      .then(data => {
        const map = {}
        for (const { date, count } of (data.activity ?? [])) map[date] = count
        setActivityMap(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username])

  const { grid, monthLabels, totalContributions } = useMemo(() => {
    const today = new Date()
    const gridStart = startOfWeek(subDays(today, WEEKS * 7 - 1), { weekStartsOn: 0 })
    const allDays = eachDayOfInterval({ start: gridStart, end: today })

    // Pad to full weeks
    const padded = [...allDays]
    while (padded.length % 7 !== 0) {
      padded.push(new Date(padded[padded.length - 1].getTime() + 86400000))
    }

    const weeks = []
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))

    // Month labels
    const seen = new Set()
    const labels = []
    weeks.forEach((week, wi) => {
      const d = week[0]
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!seen.has(key)) {
        seen.add(key)
        labels.push({ weekIndex: wi, label: MONTH_NAMES[d.getMonth()] })
      }
    })

    const cutoff = format(subDays(today, 364), 'yyyy-MM-dd')
    let total = 0
    for (const [date, count] of Object.entries(activityMap)) {
      if (date >= cutoff) total += count
    }

    return { grid: weeks, monthLabels: labels, totalContributions: total }
  }, [activityMap])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-4 w-40 bg-accent rounded animate-pulse mb-3" />
        <div className="h-28 bg-accent rounded animate-pulse" />
      </div>
    )
  }

  const CELL = 12   // px — cell size
  const GAP  = 3    // px — gap between cells

  return (
    <div className="rounded-xl border border-border bg-card p-4 select-none" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Activity</span>
        <span className="text-xs text-muted-foreground">
          {totalContributions.toLocaleString()} contributions this year
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-0" style={{ minWidth: 'max-content' }}>

          {/* Month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: 28 }}>
            {grid.map((_, wi) => {
              const lbl = monthLabels.find(m => m.weekIndex === wi)
              return (
                <div
                  key={wi}
                  className="text-[9px] text-muted-foreground overflow-hidden"
                  style={{ width: CELL + GAP }}
                >
                  {lbl?.label ?? ''}
                </div>
              )
            })}
          </div>

          {/* Grid rows — one row per day of week */}
          {[0,1,2,3,4,5,6].map(dayIdx => (
            <div key={dayIdx} className="flex items-center" style={{ marginBottom: GAP }}>
              {/* Day label */}
              <div
                className="text-[9px] text-muted-foreground text-right pr-1.5 shrink-0"
                style={{ width: 26 }}
              >
                {dayIdx % 2 === 1 ? DAY_LABELS[dayIdx] : ''}
              </div>

              {/* Cells for this day across all weeks */}
              {grid.map((week, wi) => {
                const day = week[dayIdx]
                const dateStr = format(day, 'yyyy-MM-dd')
                const count = activityMap[dateStr] ?? 0
                const level = getLevel(count)
                const isFuture = day > new Date()
                const isActive = tooltip?.date === dateStr

                return (
                  <div
                    key={wi}
                    className={`rounded-sm cursor-pointer transition-all duration-100 relative
                      ${isFuture ? 'opacity-0 pointer-events-none' : LEVEL_BG[level]}
                      ${isActive ? 'ring-1 ring-white/70 scale-125 z-10' : 'hover:ring-1 hover:ring-white/40 hover:scale-110'}
                    `}
                    style={{ width: CELL, height: CELL, marginRight: GAP }}
                    onMouseEnter={() => setTooltip({ date: dateStr, count, wi, dayIdx })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-muted-foreground mr-1">Less</span>
        {LEVEL_BG.map((cls, i) => (
          <div key={i} className={`rounded-sm ${cls}`} style={{ width: CELL, height: CELL }} />
        ))}
        <span className="text-[9px] text-muted-foreground ml-1">More</span>
      </div>

      {/* Tooltip — inline, above the hovered cell area */}
      {tooltip && (
        <div className="mt-2 flex justify-center pointer-events-none">
          <div className="bg-popover border border-border rounded-md px-3 py-1.5 text-xs shadow-md text-center">
            <span className="font-semibold text-foreground">
              {tooltip.count === 0
                ? 'No activity'
                : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
            </span>
            <span className="text-muted-foreground ml-1.5">{tooltip.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}
