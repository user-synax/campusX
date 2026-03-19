"use client"

import Sidebar from "@/components/layout/Sidebar"
import RightPanel from "@/components/layout/RightPanel"
import MobileNav from "@/components/layout/MobileNav"
import { Toaster } from "@/components/ui/sonner"

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center md:ml-[72px] lg:ml-[280px] pb-20 md:pb-0">
        <div className="w-full max-w-2xl border-x border-border min-h-screen bg-background/50 backdrop-blur-sm">
          {children}
        </div>
      </main>

      {/* Sticky Right Panel */}
      <div className="hidden lg:block">
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Toast Notifications */}
      <Toaster position="bottom-center" />
    </div>
  )
}
