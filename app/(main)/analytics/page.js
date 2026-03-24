'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'
import { isAdmin } from '@/lib/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton'
import OverviewTab from '@/components/analytics/tabs/OverviewTab'
import UsersTab from '@/components/analytics/tabs/UsersTab'
import ContentTab from '@/components/analytics/tabs/ContentTab'
import EconomyTab from '@/components/analytics/tabs/EconomyTab'
import ResourcesTab from '@/components/analytics/tabs/ResourcesTab'
import ChatsTab from '@/components/analytics/tabs/ChatsTab'
import EventsTab from '@/components/analytics/tabs/EventsTab'
import ModerationTab from '@/components/analytics/tabs/ModerationTab'

const RANGE_OPTIONS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }, 
    { value: 'all', label: 'All Time' },
]

export default function AnalyticsPage() {
    const router = useRouter()
    const { user, loading: userLoading } = useUser()

    const [range, setRange] = useState('30d')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lastFetched, setLastFetched] = useState(null)

    // ── Admin guard ──
    useEffect(() => {
        if (!userLoading && (!user || !isAdmin(user))) {
            router.push('/feed')
        }
    }, [user, userLoading, router])

    const fetchAnalytics = useCallback(async (r) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/analytics?range=${r}`)
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `HTTP ${res.status}`)
            }
            const json = await res.json()
            setData(json)
            setLastFetched(json.fetchedAt)
        } catch (err) {
            setError(err.message || 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch on mount and range change
    useEffect(() => {
        if (!userLoading && user && isAdmin(user)) {
            fetchAnalytics(range)
        }
    }, [range, user, userLoading, fetchAnalytics])

    // Show skeleton while auth is resolving
    if (userLoading) return <AnalyticsSkeleton />

    // Don't render anything for non-admins (redirect is in flight)
    if (!user || !isAdmin(user)) return null

    return (
        <div className="pb-20 md:pb-0">
            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between gap-3">
                <h1 className="text-lg font-bold tracking-tight shrink-0">Analytics</h1>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Time range selector */}
                    <select
                        value={range}
                        onChange={e => setRange(e.target.value)}
                        className="text-xs bg-accent border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {RANGE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* Refresh button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAnalytics(range)}
                        disabled={loading}
                        className="gap-1.5 text-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {lastFetched && !loading
                            ? formatDistanceToNow(new Date(lastFetched), { addSuffix: true })
                            : loading ? 'Loading…' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Loading state */}
            {loading && !data && <AnalyticsSkeleton />}

            {/* Error state */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                    <div>
                        <p className="font-semibold">Failed to load analytics</p>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    </div>
                    <Button onClick={() => fetchAnalytics(range)} variant="outline" size="sm">
                        Try again
                    </Button>
                </div>
            )}

            {/* Main content */}
            {data && !error && (
                <Tabs defaultValue="overview" className="w-full">
                    {/* Sticky tab bar */}
                    <div className="sticky top-[57px] z-10 bg-background border-b border-border px-4 py-2">
                        <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto no-scrollbar">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="economy">Economy</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                            <TabsTrigger value="chats">Chats</TabsTrigger>
                            <TabsTrigger value="events">Events</TabsTrigger>
                            <TabsTrigger value="moderation">Moderation</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview">
                        <OverviewTab data={data} lastFetched={lastFetched} />
                    </TabsContent>

                    <TabsContent value="users">
                        <UsersTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="content">
                        <ContentTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="economy">
                        <EconomyTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="resources">
                        <ResourcesTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="chats">
                        <ChatsTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="events">
                        <EventsTab data={data} range={range} />
                    </TabsContent>

                    <TabsContent value="moderation">
                        <ModerationTab data={data} range={range} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
