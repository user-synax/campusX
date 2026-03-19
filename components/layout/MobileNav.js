"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, GraduationCap, PlusSquare, User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"
import useNotificationCount from "@/hooks/useNotificationCount"
import CreatePostDialog from "@/components/post/CreatePostDialog"

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const { count } = useNotificationCount()

  const navItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/community", icon: GraduationCap, label: "Communities" },
    { href: "#", icon: PlusSquare, label: "Post", isAction: true },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: count },
    { href: user ? `/profile/${user.username}` : "/login", icon: User, label: "Profile" },
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
                  className="w-12 h-12 text-primary"
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
              className={`w-12 h-12 relative ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
    </nav>
  )
}
