"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import RightPanel from "@/components/layout/RightPanel"
import MobileNav from "@/components/layout/MobileNav"
import MobileFAB from "@/components/layout/MobileFAB"
import { Toaster } from "@/components/ui/sonner"
import BroadcastBanner from "@/components/founder/BroadcastBanner"
import useUser from "@/hooks/useUser"
import { NotificationProvider } from "@/context/NotificationContext"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { MusicProvider } from '@/contexts/MusicContext' 
import dynamic from 'next/dynamic' 

// Lazy load the entire player — not in initial bundle 
const FloatingMusicPlayer = dynamic( 
  () => import('@/components/music/FloatingMusicPlayer'), 
  { ssr: false }  // client-side only — YouTube API needs browser 
) 

export default function MainLayout({ children }) {
  const { user } = useUser()
  const pathname = usePathname()
  
  // Register service worker and handle push permissions
  usePushNotifications()
  
  // Check if we are inside a specific chat room
  const isChatRoom = pathname.startsWith('/chats/') && pathname !== '/chats'

  return (
    <MusicProvider>
      <NotificationProvider>
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
          {/* Fixed Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className={`flex-1 flex flex-col md:ml-[72px] lg:ml-[280px] ${isChatRoom ? 'pb-0 h-[100dvh] overflow-hidden' : 'pb-20 min-h-screen'} md:pb-0 overflow-x-hidden`}>
            {/* Broadcast banner — site-wide announcement */}
            <BroadcastBanner />
            
            <div className={`w-full max-w-2xl border-x border-border ${isChatRoom ? 'flex-1 h-full overflow-hidden' : 'min-h-screen'} bg-background/50 backdrop-blur-sm self-center`}>
              {children}
            </div>
          </main>

          {/* Sticky Right Panel */}
          <div className="hidden lg:block">
            <RightPanel />
          </div>

          {/* Mobile Bottom Navigation — Hide in chat room */}
          {!isChatRoom && <MobileNav />}
          
          {/* Mobile Floating Action Button — Hide in chat room */}
          {!isChatRoom && <MobileFAB />}

          {/* Toast Notifications */}
          <Toaster position="bottom-center" />

          {/* Floating music player — lazy loaded */} 
          <FloatingMusicPlayer /> 
        </div>
      </NotificationProvider>
    </MusicProvider>
  )
}
