import StatCard from '@/components/analytics/StatCard'
import BarChart from '@/components/analytics/BarChart'
import RankedTable from '@/components/analytics/RankedTable'
import { FileText, MessageCircle, TrendingUp, EyeOff, AlertTriangle } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function ContentTab({ data, range }) {
    const { content } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    const chartData = (content.timeSeries ?? []).map(d => ({ label: d.date, value: d.count }))

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Total Posts" value={content.totalPosts} icon={FileText} />
                <StatCard title={`Posts (${rangeLabel})`} value={content.postsInRange} growth={content.postGrowth} icon={FileText} />
                <StatCard title={`Comments (${rangeLabel})`} value={content.commentsInRange} icon={MessageCircle} />
                <StatCard title="Engagement Rate" value={content.engagementRate} unit="%" icon={TrendingUp} />
                <StatCard title="Hidden Posts" value={content.hiddenPosts} icon={EyeOff} />
                <StatCard title="Reported Posts" value={content.reportedPosts} icon={AlertTriangle} />
            </div>

            <BarChart
                data={chartData}
                title="Posts per Day"
                rangeLabel={rangeLabel}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RankedTable
                    title="Top Hashtags"
                    columns={[
                        { key: 'tag', label: 'Hashtag' },
                        { key: 'count', label: 'Posts', numeric: true },
                    ]}
                    rows={content.topHashtags ?? []}
                />

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <span className="text-sm font-semibold block">Post Breakdown</span>
                    {[
                        { label: 'With Images', value: content.imagePosts },
                        { label: 'With Polls', value: content.pollPosts },
                        { label: 'Anonymous', value: content.anonymousPosts },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium tabular-nums">{(item.value ?? 0).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
