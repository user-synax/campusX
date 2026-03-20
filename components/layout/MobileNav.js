"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, GraduationCap, PlusSquare, User, Bell, Bookmark, LogOut, Menu, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    { href: "#", icon: PlusSquare, label: "Post", isAction: true },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: count },
    { href: "#", icon: LogOut, label: "Logout", isLogout: true },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-4 z-50">
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

        if (item.isLogout) {
          return (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-10 h-10 text-destructive"
            >
              <Icon className="w-6 h-6" />
            </Button>
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

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetHeader className="p-6 border-b text-left">
            <SheetTitle>
              <Logo size="sm" />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              {!loading && user && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-secondary">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex-1 p-2 space-y-1">
              <Link href={`/profile/${user?.username}`}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname.startsWith("/profile") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-base font-medium">Profile</span>
                </Button>
              </Link>
              <Link href="/bookmarks">
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
              <Link href="/community">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname.startsWith("/community") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-base font-medium">Communities</span>
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-3",
                    pathname.startsWith("/events") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-base font-medium">Events</span>
                </Button>
              </Link>
            </nav>

            <div className="p-4 border-t mb-8">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-4 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
