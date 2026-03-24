import StatCard from '@/components/analytics/StatCard'
import DonutChart from '@/components/analytics/DonutChart'
import RankedTable from '@/components/analytics/RankedTable'
import { BookOpen, CheckCircle, XCircle, Clock, Download, Eye, Flag } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function ResourcesTab({ data, range }) {
    const { resources } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    const donutData = (resources.byCategory ?? []).map(c => ({
        label: c.category,
        value: c.count,
    }))

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Approved" value={resources.approved} icon={CheckCircle} />
                <StatCard title="Pending" value={resources.pending} icon={Clock} />
                <StatCard title="Rejected" value={resources.rejected} icon={XCircle} />
                <StatCard title={`Uploaded (${rangeLabel})`} value={resources.uploadedInRange} icon={BookOpen} />
                <StatCard title="Total Downloads" value={resources.totalDownloads} icon={Download} />
                <StatCard title="Total Views" value={resources.totalViews} icon={Eye} />
                <StatCard title="Copyright Flagged" value={resources.copyrightFlagged} icon={Flag} />
            </div>

            <DonutChart
                data={donutData}
                title="Approved Resources by Category"
            />

            <RankedTable
                title="Top Downloaded Resources"
                columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'downloadCount', label: 'Downloads', numeric: true },
                ]}
                rows={resources.topDownloaded ?? []}
            />
        </div>
    )
}
