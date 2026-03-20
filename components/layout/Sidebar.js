"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, User, GraduationCap, Bell, LogOut, Bookmark, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useUser from "@/hooks/useUser"
import useNotificationCount from "@/hooks/useNotificationCount"
import { cn } from "@/lib/utils"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const { count } = useNotificationCount()

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Profile", href: user ? `/profile/${user.username}` : "/login", icon: User },
    { label: "Communities", href: "/community", icon: GraduationCap },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: count },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 h-screen border-r border-border bg-background md:w-[72px] lg:w-[280px] z-40">
      <div className="p-4 lg:p-6">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CX</span>
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight">CampusX</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 lg:px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === "/feed" 
            ? pathname === "/feed" 
            : pathname.startsWith(item.href)
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-12 px-3 relative",
                  isActive ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
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
        {!loading && user && (
          <div className="mb-4">
            {isFounder(user.username) ? (
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" 
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #8b5cf6)' }} />
                
                <div className="relative rounded-xl p-3 flex items-center gap-3 bg-black/80 border border-amber-500/30">
                  <FounderAvatar user={user} size="sm" />
                  <div className="hidden lg:block flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold truncate text-foreground">{user.name}</p>
                      <span className="text-xs">⚡</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider">Founder</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-secondary">{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-4 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block text-sm font-medium">Log out</span>
        </Button>
      </div>
    </aside>
  )
}
