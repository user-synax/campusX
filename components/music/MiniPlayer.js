"use client" 
 
 /**
  * Compact floating bar — always visible when music playing. 
  */
 
 import { 
   Play, Pause, SkipForward, SkipBack, 
   X, ChevronUp, Music, GripHorizontal 
 } from 'lucide-react' 
 import { Badge } from "@/components/ui/badge"
 import { cn } from "@/lib/utils"
 
 export default function MiniPlayer({ 
   currentSong, isPlaying, isBuffering, progress, 
   hasNext, hasPrev, onTogglePlay, onNext, onPrev, 
   onExpand, onClose, onDragStart 
 }) { 
   return ( 
     <div className=" 
       w-[calc(100vw-24px)] sm:w-85 
       bg-card/95 backdrop-blur-xl 
       border border-border 
       rounded-2xl 
       shadow-[0_8px_30px_rgba(0,0,0,0.5)] 
       overflow-hidden 
       mx-3 sm:mx-0
       group/mini
     "> 
       {/* Progress bar — thin line at top */} 
       <div className="h-1 bg-border/10"> 
         <div 
           className={cn(
             "h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(var(--primary-rgb),0.6)]",
             isPlaying ? "bg-primary" : "bg-muted-foreground/40"
           )}
           style={{ width: `${progress}%` }} 
         /> 
       </div> 
 
       <div className="flex items-center gap-3 px-3 py-2.5"> 
 
         {/* Drag handle — desktop */} 
         <button 
           onMouseDown={onDragStart} 
           className="hidden md:flex text-muted-foreground/30 hover:text-muted-foreground 
                      cursor-grab active:cursor-grabbing p-1.5 transition-all hover:bg-accent rounded-md shrink-0" 
           title="Drag to move"
         > 
           <GripHorizontal className="w-4 h-4" /> 
         </button> 
 
         {/* Thumbnail */} 
         <div className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-accent cursor-pointer group/thumb shadow-md border border-border/50" onClick={onExpand}> 
           {currentSong?.thumbnail ? ( 
             <img 
               src={currentSong.thumbnail} 
               alt={currentSong.title} 
               className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500" 
             /> 
           ) : ( 
             <div className="w-full h-full flex items-center justify-center"> 
               <Music className="w-5 h-5 text-muted-foreground" /> 
             </div> 
           )} 
           {/* Buffering overlay */} 
           {isBuffering && ( 
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]"> 
               <div className="w-5 h-5 border-2 border-primary/30 border-t-primary 
                               rounded-full animate-spin" /> 
             </div> 
           )} 
         </div> 
 
         {/* Title & Status */} 
         <div className="flex-1 min-w-0 cursor-pointer py-0.5 space-y-1" onClick={onExpand}> 
           <div className="flex items-center gap-2 overflow-hidden">
             <p className="text-[13px] font-bold truncate leading-none tracking-tight"> 
               {currentSong?.title || 'No song playing'} 
             </p> 
             {isPlaying ? (
               <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-primary/15 text-primary border-none animate-pulse shrink-0 font-black">
                 PLAYING
               </Badge>
             ) : currentSong && (
               <Badge variant="outline" className="px-1.5 py-0 h-4 text-[9px] border-muted-foreground/40 text-muted-foreground shrink-0 font-bold bg-muted/20">
                 PAUSED
               </Badge>
             )}
           </div>
           <p className="text-[11px] text-muted-foreground truncate leading-none opacity-60 font-medium"> 
             {currentSong?.channel || ''} 
           </p> 
         </div> 
 
         {/* Controls */} 
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0"> 
          <div className="flex items-center gap-0.5">
            {hasPrev && ( 
              <button 
                onClick={onPrev} 
                className="w-8 h-8 flex items-center justify-center 
                           rounded-full hover:bg-accent active:scale-90 transition-all text-muted-foreground hover:text-foreground" 
              > 
                <SkipBack className="w-4 h-4" /> 
              </button> 
            )} 

            {/* Play/Pause */} 
            <button 
              onClick={onTogglePlay} 
              disabled={!currentSong} 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-primary-foreground 
                         flex items-center justify-center 
                         hover:scale-105 active:scale-95 transition-all 
                         disabled:opacity-50 shadow-lg shadow-primary/30" 
            > 
              {isBuffering ? ( 
                <div className="w-5 h-5 border-2 border-primary-foreground/30 
                                border-t-primary-foreground rounded-full animate-spin" /> 
              ) : isPlaying ? ( 
                <Pause className="w-5 h-5 fill-current" /> 
              ) : ( 
                <Play className="w-5 h-5 fill-current ml-0.5" /> 
              )} 
            </button> 

            {hasNext && ( 
              <button 
                onClick={onNext} 
                className="w-8 h-8 flex items-center justify-center 
                           rounded-full hover:bg-accent active:scale-90 transition-all text-muted-foreground hover:text-foreground" 
              > 
                <SkipForward className="w-4 h-4" /> 
              </button> 
            )} 
          </div>

          <div className="w-px h-6 bg-border/50 mx-1 shrink-0" />

          {/* Close */} 
          <button 
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center 
                       rounded-full hover:bg-destructive/10 transition-all 
                       text-muted-foreground hover:text-destructive active:scale-90" 
          > 
            <X className="w-4.5 h-4.5" /> 
          </button> 
        </div> 
      </div> 
     </div> 
   ) 
 } 
