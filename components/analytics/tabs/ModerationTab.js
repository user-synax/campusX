import StatCard from '@/components/analytics/StatCard'
import DonutChart from '@/components/analytics/DonutChart'
import RankedTable from '@/components/analytics/RankedTable'
import { ShieldAlert, Globe, Activity, AlertTriangle, Flag } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function ModerationTab({ data, range }) {
    const { moderation } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    const donutData = (moderation.byAction ?? []).slice(0, 8).map(a => ({
        label: a.action.replace(/_/g, ' '),
        value: a.count,
    }))

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Active User Bans" value={moderation.activeUserBans} icon={ShieldAlert} />
                <StatCard title="Active IP Bans" value={moderation.activeIpBans} icon={Globe} />
                <StatCard title={`Admin Actions (${rangeLabel})`} value={moderation.actionsInRange} icon={Activity} />
                <StatCard title="Active Reports" value={moderation.activeReports} icon={AlertTriangle} />
                <StatCard title="Flagged Resources" value={moderation.flaggedResources} icon={Flag} />
            </div>

            <DonutChart
                data={donutData}
                title="Admin Actions by Type"
            />

            <RankedTable
                title="Most Active Admins"
                columns={[
                    { key: 'username', label: 'Admin' },
                    { key: 'actionCount', label: 'Actions', numeric: true },
                ]}
                rows={moderation.topAdmins ?? []}
            />
        </div>
    )
}
