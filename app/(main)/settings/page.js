"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Bell, 
  Lock, 
  Eye, 
  User, 
  Shield, 
  ShieldCheck,
  Smartphone, 
  LogOut, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  AlertTriangle,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import useUser from "@/hooks/useUser"
import PushSettings from '@/components/notifications/PushSettings'

import ConfirmDeleteModal from '@/components/chat/ConfirmDeleteModal'
import EditProfileDrawer from '@/components/user/EditProfileDrawer'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: userLoading, refetch: refetchUser } = useUser()

  const [saving, setSaving] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  
  // Local state for toggles (Only keeping features that can be implemented now)
  const [settings, setSettings] = useState({
    pushNotifications: true,
    privateProfile: false,
    showOnlineStatus: true,
  })

  useEffect(() => {
    if (user?.settings) {
      // Filter out any dummy settings that might be in DB
      const activeSettings = {
        pushNotifications: user.settings.pushNotifications ?? true,
        privateProfile: user.settings.privateProfile ?? false,
        showOnlineStatus: user.settings.showOnlineStatus ?? true,
      }
      setSettings(activeSettings)
    }
  }, [user])

  const handleEditSave = (updatedUser) => {
    // refetchUser will update the global state and our local user object
    refetchUser()
    toast.success("Profile updated successfully")
  }

  const handleToggle = async (key) => {
    const newVal = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newVal }))
    
    try {
      setSaving(true)
      const res = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { ...settings, [key]: newVal } })
      })
      
      if (!res.ok) {
        // Rollback on failure
        setSettings(prev => ({ ...prev, [key]: !newVal }))
        toast.error("Failed to update setting")
      } else {
        toast.success("Settings updated", {
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
        })
      }
    } catch (error) {
      setSettings(prev => ({ ...prev, [key]: !newVal }))
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background max-w-2xl mx-auto w-full">
      
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        
        {/* Account Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Account</h2>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setEditDrawerOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 rounded-2xl border border-border transition-colors group"
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">Edit Profile</span>
                <span className="text-xs text-muted-foreground">Change name, bio, and avatar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 rounded-2xl border border-border transition-colors">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">Email Address</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Verification Status Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Verification</h2>
          </div>
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="p-4">
              {user?.isVerified && user?.verificationStatus === 'verified' ? (
                /* ── Verified ── */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22c55e15' }}>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Verified Student</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.verificationType === 'college_email' ? 'Verified via college email' : 'Verified via college ID'}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: '#22c55e15', color: '#4ade80', border: '1px solid #22c55e30' }}>
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>

              ) : user?.verificationStatus === 'pending' ? (
                /* ── Pending ── */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#facc1515' }}>
                      <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Under Review</p>
                      <p className="text-xs text-muted-foreground">Your college ID is being verified</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: '#facc1515', color: '#facc15', border: '1px solid #facc1530' }}>
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                </div>

              ) : user?.verificationStatus === 'rejected' ? (
                /* ── Rejected ── */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ef444415' }}>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Verification Rejected</p>
                        <p className="text-xs text-muted-foreground">You can resubmit with a different ID</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: '#ef444415', color: '#f87171', border: '1px solid #ef444430' }}>
                      Rejected
                    </span>
                  </div>
                  {user?.verificationRejectedReason && (
                    <div className="ml-[52px] p-3 rounded-xl text-xs text-muted-foreground leading-relaxed"
                      style={{ background: '#ef444408', border: '1px solid #ef444420' }}>
                      <span className="font-semibold text-red-400">Reason: </span>{user.verificationRejectedReason}
                    </div>
                  )}
                  <button
                    onClick={() => router.push('/verify-student')}
                    className="ml-[52px] flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 2px 8px #ef444440' }}>
                    <Upload className="w-3 h-3" /> Resubmit ID
                  </button>
                </div>

              ) : (
                /* ── Not verified ── */
                <button
                  onClick={() => router.push('/verify-student')}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22c55e10' }}>
                      <ShieldCheck className="w-5 h-5 text-green-500/60" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm group-hover:text-green-400 transition-colors">Get Verified</span>
                      <span className="text-xs text-muted-foreground">Upload your college ID to get a badge</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Bell className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Notifications</h2>
          </div>
          <div className="bg-card rounded-3xl border border-border p-4">
            <PushSettings />
          </div>
        </section>

        {/* Privacy Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Privacy & Safety</h2>
          </div>
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors border-b border-border">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Private Profile</span>
                <span className="text-xs text-muted-foreground">Only followers can see your posts</span>
              </div>
              <Switch 
                checked={settings.privateProfile} 
                onCheckedChange={() => handleToggle('privateProfile')}
              />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Online Status</span>
                <span className="text-xs text-muted-foreground">Show when you&apos;re active</span>
              </div>
              <Switch 
                checked={settings.showOnlineStatus} 
                onCheckedChange={() => handleToggle('showOnlineStatus')}
              />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4 pb-10">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-4 h-14 px-4 text-destructive hover:bg-destructive/10 rounded-2xl border border-destructive/20"
          >
            <LogOut className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Log out</span>
              <span className="text-[10px] opacity-80 italic uppercase tracking-tighter">Sign out of your account</span>
            </div>
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-widest font-bold opacity-50">
            CampusX v0.1.0 • Built with ❤️ for Students
          </p>
        </section>

      </div>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        user={user}
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        onSave={handleEditSave}
      />
    </div>
  )
}
