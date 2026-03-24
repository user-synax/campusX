import StatCard from '@/components/analytics/StatCard'
import BarChart from '@/components/analytics/BarChart'
import RankedTable from '@/components/analytics/RankedTable'
import { Users, UserCheck, UserX, Activity } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function UsersTab({ data, range }) {
    const { users } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    const chartData = (users.timeSeries ?? []).map(d => ({ label: d.date, value: d.count }))

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Total Users" value={users.total} icon={Users} />
                <StatCard title={`New (${rangeLabel})`} value={users.newInRange} growth={users.growth} icon={Users} />
                <StatCard title="Daily Active" value={users.dau} icon={Activity} />
                <StatCard title="Banned" value={users.banned} icon={UserX} />
                <StatCard title="Verified" value={users.verified} icon={UserCheck} />
            </div>

            <BarChart
                data={chartData}
                title="New Registrations per Day"
                rangeLabel={rangeLabel}
            />

            <RankedTable
                title="Top Colleges by Users"
                columns={[
                    { key: 'college', label: 'College' },
                    { key: 'count', label: 'Users', numeric: true },
                ]}
                rows={users.byCollege ?? []}
            />
        </div>
    )
}
