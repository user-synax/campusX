"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, User, GraduationCap, Bell, LogOut, Bookmark, Search, Calendar, Trophy, MessageSquare, Settings } from "lucide-react"
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Logo from "@/components/shared/Logo"
import useUser from "@/hooks/useUser"
import { useNotifications } from "@/hooks/useNotifications"
import { useMusic } from '@/contexts/MusicContext' 
import { Music as MusicIcon } from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import { cn } from "@/lib/utils"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const { unreadCount } = useNotifications()
  const chatUnread = useChatUnreadCount()
  const { currentSong, isPlayerOpen, openPlayer, closePlayer } = useMusic()

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Chats", href: "/chats", icon: MessageSquare, badge: chatUnread },
    { label: "Communities", href: "/community", icon: GraduationCap },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Profile", href: user?.username ? `/profile/${user.username}` : "/login", icon: User },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      window.location.reload() // Clear all state
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] lg:w-[280px] border-r border-border bg-background z-50 hidden md:flex flex-col">
      <div className="p-6">
        <Logo className="lg:hidden" showText={false} />
        <Logo className="hidden lg:flex" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-12 px-3 relative transition-all duration-200",
                  isActive ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-base font-medium">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {/* Music button — at bottom of nav, above user card */} 
        <button 
          onClick={isPlayerOpen ? closePlayer : openPlayer} 
          className={cn(
            "flex items-center gap-4 w-full px-3 py-3 rounded-xl mb-4 transition-all duration-200 hover:bg-accent group",
            isPlayerOpen ? "text-primary bg-primary/5" : "text-muted-foreground"
          )}
        > 
          <div className="relative"> 
            <MusicIcon className={cn("w-5 h-5 transition-transform duration-300", isPlayerOpen && "scale-110")} /> 
            {currentSong && !isPlayerOpen && ( 
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" /> 
            )} 
          </div> 
          <span className="hidden lg:block text-sm font-bold tracking-tight"> 
            {currentSong && isPlayerOpen ? 'Music ▶' : 'Music'} 
          </span> 
        </button>

        {!loading && user && user.username && (
          <div className="mb-4 space-y-4">
            {/* XP Progress Bar */}
            <div className="hidden lg:block px-2 space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level {user.level || 1}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{(user.xp || 0) % 1000} / 1000 XP</span>
              </div>
              <Progress value={((user.xp || 0) % 1000) / 10} className="h-1.5" />
            </div>

            {isFounder(user.username) ? (
              <Link href={`/profile/${user.username}`}>
                <div className="flex flex-col lg:flex-row items-center gap-3 p-2 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                  <FounderAvatar user={user} size="md" />
                  <div className="hidden lg:block flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-primary/80 font-medium truncate">Founder</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href={`/profile/${user.username}`}>
                <div className="flex flex-col lg:flex-row items-center gap-3 p-2 rounded-xl hover:bg-accent transition-colors">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-secondary">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <NotificationBell currentUser={user} />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex-1 justify-start gap-4 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Log out</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
