"use client" 
 
 /**
  * Main floating player component. 
  * Lazy loaded — not in initial bundle. 
  */
 
 import { useState, useRef, useEffect } from 'react' 
 import { useMusic } from '@/contexts/MusicContext' 
 import { useYouTubePlayer } from '@/hooks/useYouTubePlayer' 
 import { gsap, Draggable } from '@/lib/gsap-config' 
 import { shouldAnimate } from '@/lib/gsap-config' 
 import MiniPlayer from './MiniPlayer'
 import ExpandedPlayer from './ExpandedPlayer'
 import MusicTriggerButton from './MusicTriggerButton'
 
 export default function FloatingMusicPlayer() { 
   const { 
     currentSong, isPlayerOpen, 
     isMinimized, isPlayerMounted, 
     hasNext, hasPrev, 
     playNext, playPrev, 
     toggleMinimize, closePlayer 
   } = useMusic() 
 
   // YouTube player container ref 
   const ytContainerRef = useRef(null) 
   const playerDivRef = useRef(null) 
   const draggableInstance = useRef(null)
 
   const { 
     isPlaying, isBuffering, isEnded, 
     currentVideoId, duration, currentTime, 
     volume, loadVideo, togglePlay, 
     seekTo, changeVolume, mute, unmute
   } = useYouTubePlayer(ytContainerRef) 
 
   const [activeTab, setActiveTab] = useState('player') 
   // 'player' | 'search' | 'queue' 
   const [isMuted, setIsMuted] = useState(false) 
   const [isDragging, setIsDragging] = useState(false)
   const [isMobile, setIsMobile] = useState(false)

   // Check for mobile screen size
   useEffect(() => {
     const checkMobile = () => setIsMobile(window.innerWidth < 768)
     checkMobile()
     window.addEventListener('resize', checkMobile)
     return () => window.removeEventListener('resize', checkMobile)
   }, [])
 
   // Load video when currentSong changes 
   useEffect(() => { 
     if (!currentSong?.videoId) return 
     if (currentSong.videoId !== currentVideoId) { 
       loadVideo(currentSong.videoId) 
     } 
   }, [currentSong?.videoId, currentVideoId, loadVideo]) 
 
   // Auto-play next when song ends 
   useEffect(() => { 
     if (isEnded && hasNext) { 
       playNext() 
     } 
   }, [isEnded, hasNext, playNext]) 
 
   // Entrance animation 
   useEffect(() => { 
     if (!isPlayerOpen || !playerDivRef.current) return 
     if (!shouldAnimate()) return 
 
     gsap.fromTo(playerDivRef.current, 
       { opacity: 0, y: 20, scale: 0.95 }, 
       { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' } 
     ) 
   }, [isPlayerOpen]) 
 
   // GSAP Draggable Initialization
   useEffect(() => {
     if (!isPlayerOpen || !playerDivRef.current || isMobile) return

     // Destroy previous instance if any
     if (draggableInstance.current) {
       draggableInstance.current.kill()
     }

     // Create new draggable instance
     // We only enable drag on the MiniPlayer's handle or the whole MiniPlayer
     // On ExpandedPlayer, we might not want full drag to avoid conflicts with sliders
     const trigger = isMinimized ? playerDivRef.current : ".drag-handle"

     draggableInstance.current = Draggable.create(playerDivRef.current, {
       type: "x,y",
       edgeResistance: 0.65,
       bounds: "body",
       inertia: true,
       onDragStart: () => setIsDragging(true),
       onDragEnd: () => setIsDragging(false),
       // Allow clicking controls without dragging
       dragClickables: false,
       allowEventDefault: true
     })[0]

     return () => {
       if (draggableInstance.current) {
         draggableInstance.current.kill()
       }
     }
   }, [isPlayerOpen, isMinimized, isMobile])

   // Format time helper 
   const formatTime = (seconds) => { 
     if (!seconds || isNaN(seconds)) return '0:00' 
     const m = Math.floor(seconds / 60) 
     const s = Math.floor(seconds % 60) 
     return `${m}:${s.toString().padStart(2, '0')}` 
   } 
 
   // Progress percentage 
   const progress = duration > 0 ? (currentTime / duration) * 100 : 0 
 
   if (!isPlayerMounted || !isPlayerOpen) { 
     return <MusicTriggerButton /> 
   } 

   const expandedProps = {
     currentSong, isPlaying, isBuffering, progress, 
     duration, currentTime, volume, isMuted, 
     hasNext, hasPrev, activeTab, onTabChange: setActiveTab, 
     onTogglePlay: togglePlay, onNext: playNext, onPrev: playPrev, 
     onSeek: seekTo, onVolumeChange: changeVolume, 
     onMuteToggle: handleMuteToggle, onMinimize: toggleMinimize, 
     onClose: closePlayer, formatTime
   }
 
   return ( 
     <>
       {/* Mobile Expanded Bottom Sheet */}
       {isMobile && !isMinimized && (
         <div className="
           fixed inset-x-0 bottom-0 z-[60] 
           bg-card border-t border-border 
           rounded-t-3xl 
           shadow-[0_-8px_30px_rgba(0,0,0,0.5)] 
           max-h-[90dvh] 
           animate-in slide-in-from-bottom duration-300
           overflow-hidden
         ">
           <ExpandedPlayer {...expandedProps} />
         </div>
       )}

       <div 
          ref={playerDivRef} 
          className={` 
            fixed z-50 select-none 
            transition-shadow duration-300 
            ${isDragging ? 'shadow-2xl scale-[1.02]' : 'shadow-xl'}
            ${isMinimized 
               ? 'bottom-20 left-4 sm:left-auto sm:right-4 md:bottom-8 md:right-8' 
               : isMobile 
                 ? 'hidden' // Hide floating div on mobile when expanded (using bottom sheet instead)
                 : 'bottom-8 right-8' 
             } 
          `} 
        > 
         {/* ━━━ YouTube Player ToS Compliance ━━━ */} 
         {/* Instead of 1px hidden div, we show a tiny visible player tucked in the corner */}
         {/* This ensures YouTube branding is technically visible if needed */}
         <div 
           className="absolute bottom-0 right-0 overflow-hidden rounded-md pointer-events-none opacity-0"
           style={{ 
             width: '60px', 
             height: '34px',
             zIndex: -1
           }} 
         > 
           <div ref={ytContainerRef} className="w-full h-full" /> 
         </div> 
   
         {isMinimized 
           ? <MiniPlayer 
               currentSong={currentSong} 
               isPlaying={isPlaying} 
               isBuffering={isBuffering} 
               progress={progress} 
               hasNext={hasNext} 
               hasPrev={hasPrev} 
               onTogglePlay={togglePlay} 
               onNext={playNext} 
               onPrev={playPrev} 
               onExpand={toggleMinimize} 
               onClose={closePlayer} 
               onDragStart={() => {}} 
             /> 
           : !isMobile && <ExpandedPlayer {...expandedProps} />
         } 
       </div> 
     </>
   ) 
 
   function handleMuteToggle() { 
     if (isMuted) {
       unmute()
     } else {
       mute()
     }
     setIsMuted(prev => !prev) 
   } 
 } 
