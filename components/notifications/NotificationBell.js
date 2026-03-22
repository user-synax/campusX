"use client" 
 
import { useState, useEffect, useRef } from 'react' 
import { useNotifications } from '@/hooks/useNotifications' 
import { Bell } from 'lucide-react' 
import { gsap, shouldAnimate } from '@/lib/gsap-config' 
import Link from 'next/link' 
import { useRouter } from 'next/navigation' 
import NotificationItem from './NotificationItem' 
import NotificationItemSkeleton from './NotificationItemSkeleton' 
 
export default function NotificationBell({ currentUser }) { 
  const router = useRouter() 
  const { 
    unreadCount, 
    newNotification, 
    markAllRead, 
    markOneRead 
  } = useNotifications() 
 
  const [dropdownOpen, setDropdownOpen] = useState(false) 
  const [notifications, setNotifications] = useState([]) 
  const [loading, setLoading] = useState(false) 
  const [isMobile, setIsMobile] = useState(false) 
 
  const bellContainerRef = useRef(null) 
  const bellRef = useRef(null) 
  const dropdownRef = useRef(null)

  // GSAP Animation for dropdown
  useEffect(() => {
    if (dropdownOpen && dropdownRef.current && !isMobile) {
      if (!shouldAnimate()) return
      
      gsap.fromTo(dropdownRef.current,
        { 
          opacity: 0, 
          y: 20, 
          scale: 0.95,
          transformOrigin: 'left bottom'
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.3,
          ease: 'power3.out'
        }
      )
    }
  }, [dropdownOpen, isMobile])
 
  // Detect mobile 
  useEffect(() => { 
    const check = () => setIsMobile(window.innerWidth < 768) 
    check() 
    window.addEventListener('resize', check) 
    return () => window.removeEventListener('resize', check) 
  }, []) 
 
  // Bell shake animation on new notification 
  useEffect(() => { 
    if (!newNotification || !bellRef.current) return 
    if (!shouldAnimate()) return 
 
    gsap.fromTo(bellRef.current, 
      { rotation: 0 }, 
      { 
        rotation: 15, 
        duration: 0.1, 
        ease: 'power2.inOut', 
        yoyo: true, 
        repeat: 5, 
        onComplete: () => gsap.set(bellRef.current, { rotation: 0 }) 
      } 
    ) 
  }, [newNotification]) 
 
  // Fetch notifications when dropdown opens 
  const handleBellClick = async () => { 
    if (isMobile) { 
      router.push('/notifications') 
      return 
    } 
 
    const opening = !dropdownOpen 
    setDropdownOpen(opening) 
 
    if (opening && notifications.length === 0) { 
      setLoading(true) 
      try { 
        const res = await fetch('/api/notifications?limit=10') 
        if (res.ok) {
          const data = await res.json() 
          setNotifications(data.notifications) 
        }
      } catch (err) {
        console.error('[NotificationBell] Fetch failed:', err)
      } 
      setLoading(false) 
    } 
  } 
 
  // Close dropdown on outside click 
  useEffect(() => { 
    const handleClick = (e) => { 
      if (!bellContainerRef.current?.contains(e.target)) { 
        setDropdownOpen(false) 
      } 
    } 
    if (dropdownOpen) { 
      document.addEventListener('mousedown', handleClick) 
      return () => document.removeEventListener('mousedown', handleClick) 
    } 
  }, [dropdownOpen]) 
 
  if (!currentUser) return null 
 
  return ( 
    <div ref={bellContainerRef} className="relative"> 
 
      {/* ━━━ Bell Button ━━━ */} 
      <button 
        onClick={handleBellClick} 
        className="relative w-10 h-10 flex items-center justify-center 
                   rounded-full hover:bg-accent transition-colors" 
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`} 
      > 
        {/* Bell icon with animation ref */} 
        <span ref={bellRef} className="inline-flex" style={{ transformOrigin: 'top center' }}> 
          <Bell 
            className={`w-5 h-5 ${unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`} 
            fill={unreadCount > 0 ? 'currentColor' : 'none'} 
          /> 
        </span> 
 
        {/* Unread count badge */} 
        {unreadCount > 0 && ( 
          <span className=" 
            absolute -top-0.5 -right-0.5 
            min-w-[18px] h-[18px] 
            bg-primary text-primary-foreground 
            text-[10px] font-black 
            rounded-full 
            flex items-center justify-center 
            px-1 
            ring-2 ring-background 
            animate-in zoom-in-50 duration-200 
          "> 
            {unreadCount > 99 ? '99' : unreadCount} 
          </span> 
        )} 
      </button> 
 
      {/* ━━━ Desktop Dropdown ━━━ */} 
      {dropdownOpen && !isMobile && ( 
        <div 
          ref={dropdownRef}
          className=" 
            absolute left-0 bottom-full mb-2 z-50 
            w-[380px] 
            bg-card border border-border 
            rounded-2xl shadow-2xl 
            overflow-hidden 
          "
        > 
 
          {/* Dropdown header */} 
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30"> 
            <h3 className="font-bold text-base">Notifications</h3> 
            <div className="flex items-center gap-2"> 
              {unreadCount > 0 && ( 
                <button 
                  onClick={() => { markAllRead(); setNotifications(prev => prev.map(n => ({...n, read: true}))) }} 
                  className="text-xs text-primary hover:underline font-medium" 
                > 
                  Mark all read 
                </button> 
              )} 
              <Link 
                href="/notifications" 
                onClick={() => setDropdownOpen(false)} 
                className="text-xs text-muted-foreground hover:text-foreground" 
              > 
                See all → 
              </Link> 
            </div> 
          </div> 
 
          {/* Notification list */} 
          <div className="max-h-[420px] overflow-y-auto"> 
            {loading ? ( 
              // Skeleton 
              Array(4).fill(0).map((_, i) => ( 
                <NotificationItemSkeleton key={i} /> 
              )) 
            ) : notifications.length === 0 ? ( 
              <div className="py-12 text-center"> 
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" /> 
                <p className="text-sm text-muted-foreground font-medium">No notifications yet</p> 
                <p className="text-xs text-muted-foreground px-8 mt-1">When people interact with you, you&apos;ll see it here.</p>
              </div> 
            ) : ( 
              notifications.map(notification => ( 
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                  onRead={() => { 
                    markOneRead(notification._id) 
                    setNotifications(prev => 
                      prev.map(n => n._id === notification._id 
                        ? { ...n, read: true } 
                        : n 
                      ) 
                    ) 
                    setDropdownOpen(false) 
                  }} 
                /> 
              )) 
            )} 
          </div> 
 
          {/* Footer */} 
          <div className="border-t border-border px-4 py-2.5 bg-muted/10"> 
            <Link 
              href="/notifications" 
              onClick={() => setDropdownOpen(false)} 
              className="block text-center text-sm text-primary hover:underline font-medium" 
            > 
              View all notifications 
            </Link> 
          </div> 
        </div> 
      )} 
    </div> 
  ) 
} 
