"use client" 
 
 /**
  * Small button shown when player is closed. 
  * Click → opens player. 
  */
 
 import { useMusic } from '@/contexts/MusicContext' 
 import { Headphones, Disc3 } from 'lucide-react' 
 import { Badge } from "@/components/ui/badge"
 import { cn } from "@/lib/utils"
 
 export default function MusicTriggerButton() { 
   const { openPlayer, currentSong } = useMusic() 
 
   return ( 
     <div className="hidden md:block fixed md:bottom-8 md:right-8 z-40 group">
       <button 
         onClick={openPlayer} 
         className=" 
           w-14 h-14 md:w-12 md:h-12 rounded-full 
           bg-primary text-primary-foreground 
           shadow-[0_8px_30px_rgb(var(--primary-rgb),0.4)] 
           flex items-center justify-center 
           hover:scale-110 active:scale-95 transition-all duration-300
           relative
         " 
         title={currentSong ? `Resume: ${currentSong.title}` : 'Open Music Player'} 
       > 
         <Disc3 className={cn(
           "w-7 h-7 md:w-6 md:h-6 fill-current transition-transform duration-500",
           currentSong && "animate-[spin_3s_linear_infinite]"
         )} /> 
         {currentSong && ( 
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-background 
                            rounded-full flex items-center justify-center border-2 border-primary">
             <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
           </span> 
         )} 
       </button>
       
       {/* Status Label on Hover */}
       <Badge 
         variant="secondary" 
         className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-background/80 backdrop-blur-sm border border-border text-[10px] font-bold"
       >
         {currentSong ? 'RESUME PLAYBACK' : 'OPEN PLAYER'}
       </Badge>
     </div>
   ) 
 } 
