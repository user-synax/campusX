"use client"

import { HeroSection } from "@/components/ui/hero-section"
import { ArrowRight } from "lucide-react"

export function HeroSectionDemo() {
  return (
    <HeroSection
      badge={{
        text: "🎓 New Features Available",
        action: {
          text: "Explore",
          href: "/feed",
        },
      }}
      title="India ka apna Student Social Network"
      description="Posts, chats, notes, code area — sab ek jagah. Sirf apne college waalon ke saath. Free. Forever."
      actions={[
        {
          text: "Join Free",
          href: "/signup",
          variant: "default",
        },
        {
          text: "See How It Works",
          href: "#features",
          variant: "glow",
          icon: <ArrowRight className="h-5 w-5" />,
        },
      ]}
    />
  )
}
