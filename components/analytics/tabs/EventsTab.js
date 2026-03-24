import StatCard from '@/components/analytics/StatCard'
import DonutChart from '@/components/analytics/DonutChart'
import RankedTable from '@/components/analytics/RankedTable'
import { Calendar, Clock, CheckCircle, Users, Plus } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function EventsTab({ data, range }) {
    const { events } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    const donutData = (events.byCollege ?? []).slice(0, 8).map(c => ({
        label: c.college || 'Unknown',
        value: c.count,
    }))

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Active Events" value={events.active} icon={Calendar} />
                <StatCard title="Upcoming" value={events.upcoming} icon={Clock} />
                <StatCard title="Past Events" value={events.past} icon={CheckCircle} />
                <StatCard title={`Created (${rangeLabel})`} value={events.createdInRange} icon={Plus} />
                <StatCard title="Total RSVPs" value={events.totalRsvps} icon={Users} />
            </div>

            <DonutChart
                data={donutData}
                title="Events by College (Top 8)"
            />

            <RankedTable
                title="Top Events by RSVPs"
                columns={[
                    { key: 'title', label: 'Event' },
                    { key: 'college', label: 'College' },
                    { key: 'rsvpCount', label: 'RSVPs', numeric: true },
                ]}
                rows={events.topEvents ?? []}
            />
        </div>
    )
}
