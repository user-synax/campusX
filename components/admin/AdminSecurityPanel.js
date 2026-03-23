"use client"

import { useState, useEffect } from 'react'
import {
  Shield,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function AdminSecurityPanel() {
  const [suspiciousAccounts, setSuspiciousAccounts] = useState([])
  const [ipBans, setIpBans] = useState([])
  const [loading, setLoading] = useState(true)
  const [banIP, setBanIP] = useState('')
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('null')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      const [suspiciousRes, ipBansRes] = await Promise.all([
        fetch('/api/admin/security/suspicious'),
        fetch('/api/admin/security/ip-bans')
      ])

      const suspiciousData = await suspiciousRes.json()
      const ipBansData = await ipBansRes.json()

      setSuspiciousAccounts(suspiciousData.suspicious || [])
      setIpBans(ipBansData.ipBans || [])
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const handleBanIP = async () => {
    if (!banIP.trim()) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/security/ip-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: banIP,
          reason: banReason || 'Manual admin ban',
          duration: banDuration === 'null' ? null : parseInt(banDuration)
        })
      })

      if (res.ok) {
        toast.success(`IP ${banIP} banned successfully`)
        setBanIP('')
        setBanReason('')
        fetchSecurityData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Ban failed')
      }
    } catch (error) {
      console.error('IP ban failed:', error)
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnbanIP = async (ip) => {
    try {
      const res = await fetch(`/api/admin/security/ip-ban/${ip}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success(`IP ${ip} unbanned`)
        fetchSecurityData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Unban failed')
      }
    } catch (error) {
      console.error('IP unban failed:', error)
    }
  }

  if (loading && suspiciousAccounts.length === 0 && ipBans.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Suspicious Logins Section */}
      <Card className="bg-accent/20 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Suspicious Login Attempts
          </CardTitle>
          <CardDescription className="text-xs">
            Accounts with 3 or more failed attempts in the last 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {suspiciousAccounts.length > 0 ? (
            suspiciousAccounts.map((account, index) => (
              <div key={account._id} className={`flex items-center justify-between px-4 py-3 ${index !== suspiciousAccounts.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="min-w-0">
                  <p className="text-xs font-black font-mono truncate">{account.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {account.attempts} failed attempts · Last: {formatDistanceToNow(new Date(account.lastAttempt), { addSuffix: true })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent border border-border/50 font-mono">
                      IP: {account.ip}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[10px] font-bold uppercase tracking-tight"
                  onClick={() => toast.info('Feature coming soon')} // Clear attempts logic can be added
                >
                  Reset
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No suspicious accounts found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* IP Ban Form */}
      <Card className="bg-accent/20 border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            New IP Ban
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">IP Address</label>
              <Input
                value={banIP}
                onChange={(e) => setBanIP(e.target.value)}
                placeholder="e.g. 1.2.3.4"
                className="bg-background border-border/50 text-xs font-mono h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Duration</label>
              <select 
                value={banDuration} 
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-md h-9 px-3 text-xs focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="null">Permanent</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Reason</label>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Spamming / Bot activity"
              className="bg-background border-border/50 text-xs h-9"
            />
          </div>
          <Button 
            className="w-full h-9 text-xs font-bold uppercase tracking-widest"
            onClick={handleBanIP}
            disabled={!banIP || submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ban IP Address'}
          </Button>
        </CardContent>
      </Card>

      {/* Active IP Bans List */}
      <Card className="bg-accent/20 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            Active IP Bans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ipBans.length > 0 ? (
            ipBans.map((ban, index) => (
              <div key={ban._id} className={`flex items-center justify-between px-4 py-3 ${index !== ipBans.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="min-w-0">
                  <p className="text-xs font-black font-mono truncate">{ban.ip}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{ban.reason}</p>
                  <p className="text-[9px] font-bold uppercase tracking-tight text-red-400 mt-1">
                    {ban.expiresAt 
                      ? `Expires: ${formatDistanceToNow(new Date(ban.expiresAt), { addSuffix: true })}` 
                      : 'Permanent Ban'
                    }
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[10px] font-bold uppercase tracking-tight text-red-400 hover:bg-red-400/10 border-red-400/20"
                  onClick={() => handleUnbanIP(ban.ip)}
                >
                  Unban
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No active IP bans.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
