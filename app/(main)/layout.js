"use client"

import Sidebar from "@/components/layout/Sidebar"
import RightPanel from "@/components/layout/RightPanel"
import MobileNav from "@/components/layout/MobileNav"
import MobileFAB from "@/components/layout/MobileFAB"
import { Toaster } from "@/components/ui/sonner"
import BroadcastBanner from "@/components/founder/BroadcastBanner"
import useUser from "@/hooks/useUser"

export default function MainLayout({ children }) {
  const { user } = useUser()

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-[72px] lg:ml-[280px] pb-20 md:pb-0 overflow-x-hidden">
        {/* Broadcast banner — site-wide announcement */}
        <BroadcastBanner />
        
        <div className="w-full max-w-2xl border-x border-border min-h-screen bg-background/50 backdrop-blur-sm overflow-x-hidden self-center">
          {children}
        </div>
      </main>

      {/* Sticky Right Panel */}
      <div className="hidden lg:block">
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
      
      {/* Mobile Floating Action Button */}
      <MobileFAB />

      {/* Toast Notifications */}
      <Toaster position="bottom-center" />
    </div>
  )
}
