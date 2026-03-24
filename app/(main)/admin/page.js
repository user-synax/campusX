"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { isAdmin } from '@/lib/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import AdminUsersTable from '@/components/admin/AdminUsersTable'
import AdminReportedContent from '@/components/admin/AdminReportedContent'
import AdminSecurityPanel from '@/components/admin/AdminSecurityPanel'
import AdminShopManager from '@/components/admin/AdminShopManager'
import { formatDistanceToNow } from 'date-fns'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState({
    users: 0,
    banned: 0,
    reported: 0,
    pendingResources: 0
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading) {
      if (!user || !isAdmin(user)) {
        router.push('/feed')
      } else {
        fetchOverviewData()
      }
    }
  }, [user, userLoading, router])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      // Fetch overview stats and recent logs in parallel
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/users?limit=1'), // Using this to get total and banned count for now
        fetch('/api/admin/logs?page=1')
      ])

      const statsData = await statsRes.json()
      const logsData = await logsRes.json()

      // For pending resources, we'd ideally have a specific endpoint or fetch from resources API
      // Let's assume there's an endpoint or we mock it for now
      const resourcesRes = await fetch('/api/admin/resources?status=pending').catch(() => ({ json: () => ({ total: 0 }) }))
      const resourcesData = await resourcesRes.json()

      // For reported content
      const reportedRes = await fetch('/api/admin/content/reported').catch(() => ({ json: () => ({ posts: [] }) }))
      const reportedData = await reportedRes.json()

      setStats({
        users: statsData.total || 0,
        banned: statsData.bannedCount || 0,
        reported: reportedData.posts?.length || 0,
        pendingResources: resourcesData.total || 0
      })
      setRecentLogs(logsData.logs?.slice(0, 5) || [])
    } catch (error) {
      console.error('Failed to fetch overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="p-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight">Admin Dashboard</h1>
        <Button variant="ghost" size="sm" onClick={fetchOverviewData}>
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="px-4 py-2 border-b border-border sticky top-[57px] bg-background z-10">
          <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            <AdminStatCard title="Total Users" value={stats.users} icon="👤" />
            <AdminStatCard title="Banned" value={stats.banned} icon="🚫" color="red" />
            <AdminStatCard title="Reported Posts" value={stats.reported} icon="🚨" color="amber" />
            <AdminStatCard title="Pending Resources" value={stats.pendingResources} icon="📚" color="blue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
            <Link href="/admin/resources">
              <Button variant="outline" className="w-full justify-start gap-3 h-14 bg-accent/30 hover:bg-accent/50 border-border/50">
                <span className="text-2xl">📋</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">Review Resources</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingResources} pending</p>
                </div>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start gap-3 h-14 bg-accent/30 hover:bg-accent/50 border-border/50">
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">Analytics</p>
                  <p className="text-xs text-muted-foreground">View platform stats</p>
                </div>
              </Button>
            </Link>
          </div>

          <div className="px-4 mt-6">
            <h3 className="font-bold text-sm mb-3 px-1">Recent Actions</h3>
            <Card className="bg-accent/20 border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, index) => (
                    <div key={log._id} className={`flex items-center gap-3 px-4 py-3 ${index !== recentLogs.length - 1 ? 'border-b border-border/50' : ''}`}>
                      <span className="text-lg">{getActionEmoji(log.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{log.summary}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })} by @{log.adminId?.username}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No recent actions found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersTable />
        </TabsContent>

        <TabsContent value="content">
          <AdminReportedContent />
        </TabsContent>

        <TabsContent value="shop">
          <AdminShopManager />
        </TabsContent>

        <TabsContent value="security">
          <AdminSecurityPanel />
        </TabsContent>

        <TabsContent value="logs">
          <div className="p-4 text-center text-sm text-muted-foreground">
            Use the Logs tab to view all audit entries.
            {/* Full logs viewer can be implemented here or as a separate component */}
            <Link href="/admin/logs" className="block mt-4">
              <Button variant="outline">View Full Audit Trail</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminStatCard({ title, value, icon, color }) {
  const colors = {
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    default: 'text-foreground bg-accent/50 border-border/50'
  }

  const colorClass = colors[color] || colors.default

  return (
    <Card className={`border ${colorClass}`}>
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1 flex items-center justify-between">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-xl opacity-80">{icon}</span>
      </CardContent>
    </Card>
  )
}

function getActionEmoji(action) {
  const emojis = {
    user_ban: '🚫',
    user_unban: '✅',
    user_verify: '✅',
    user_unverify: '❌',
    user_delete: '🗑️',
    user_make_admin: '⭐',
    user_remove_admin: '🛡️',
    user_award_coins: '💰',
    post_delete: '🗑️',
    post_hide: '🙈',
    post_unhide: '👁️',
    ip_ban: '🔒',
    ip_unban: '🔓'
  }
  return emojis[action] || '📝'
}
