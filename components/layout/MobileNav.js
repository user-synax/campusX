"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, GraduationCap, PlusSquare, User, Bell, Bookmark, LogOut, Menu, Search, Calendar, Trophy, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useUser from "@/hooks/useUser"
import useNotificationCount from "@/hooks/useNotificationCount"
import CreatePostDialog from "@/components/post/CreatePostDialog"
import Logo from "@/components/shared/Logo"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const { count } = useNotificationCount()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: `/profile/${user?.username}`, icon: User, label: "Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: count },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        if (item.isAction) {
          return (
            <CreatePostDialog 
              key={item.label} 
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-primary"
                >
                  <Icon className="w-6 h-6" />
                </Button>
              }
            />
          )
        }

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 relative ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-background">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Button>
          </Link>
        )
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-70 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-left">
            <SheetTitle>
              <Logo size="sm" />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-4 border-b">
              {!loading && user && (
                <Link 
                  href={`/profile/${user?.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg transition-colors"
                >
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-secondary">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </Link>
              )}
              {/* XP Progress Bar */}
              {!loading && user && (
                <div className="px-2 pt-4 pb-2 space-y-1.5 border-t mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level {user.level || 1}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{(user.xp || 0) % 1000} / 1000 XP</span>
                  </div>
                  <Progress value={((user.xp || 0) % 1000) / 10} className="h-1.5" />
                </div>
              )}
            </div>

            <nav className="p-2 space-y-1">
              {/* <Link href={`/profile/${user?.username}`} onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === `/profile/${user?.username}` ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-base font-medium">Profile</span>
                </Button>
              </Link> */}
              {/* <Link href="/search" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === "/search" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Search className="w-5 h-5" />
                  <span className="text-base font-medium">Search</span>
                </Button>
              </Link> */}
              <Link href="/leaderboard" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === "/leaderboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Trophy className="w-5 h-5" />
                  <span className="text-base font-medium">Leaderboard</span>
                </Button>
              </Link>
              <Link href="/bookmarks" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === "/bookmarks" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Bookmark className="w-5 h-5" />
                  <span className="text-base font-medium">Bookmarks</span>
                </Button>
              </Link>
              <Link href="/community" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === "/community" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-base font-medium">Communities</span>
                </Button>
              </Link>
              <Link href="/events" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname === "/events" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-base font-medium">Events</span>
                </Button>
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t mt-auto">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-4 h-12 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base font-medium">Log out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
