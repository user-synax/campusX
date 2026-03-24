import StatCard from '@/components/analytics/StatCard'
import RankedTable from '@/components/analytics/RankedTable'
import { MessageSquare, Users, Hash } from 'lucide-react'

const RANGE_LABELS = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' }

export default function ChatsTab({ data, range }) {
    const { chats } = data
    const rangeLabel = RANGE_LABELS[range] ?? range

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Active Groups" value={chats.activeGroups} icon={MessageSquare} />
                <StatCard title={`New Groups (${rangeLabel})`} value={chats.newInRange} icon={MessageSquare} />
                <StatCard title="Total Messages" value={chats.totalMessages} icon={Hash} />
                <StatCard title="Avg Members/Group" value={chats.avgMemberCount} icon={Users} />
            </div>

            <RankedTable
                title="Most Active Groups"
                columns={[
                    { key: 'name', label: 'Group Name' },
                    { key: 'messageCount', label: 'Messages', numeric: true },
                ]}
                rows={chats.topGroups ?? []}
            />
        </div>
    )
}
