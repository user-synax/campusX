"use client" 
 
 /**
  * Full expanded player with search + queue tabs. 
  */
 
 import { 
   Play, Pause, SkipForward, SkipBack, 
   Volume2, VolumeX, X, ChevronDown, 
   ListMusic, Search, Music 
 } from 'lucide-react' 
 import MusicSearch from './MusicSearch' 
 import MusicQueue from './MusicQueue' 
 import { Badge } from "@/components/ui/badge"
 import { cn } from "@/lib/utils"
 
 export default function ExpandedPlayer({ 
   currentSong, isPlaying, isBuffering, progress, 
   duration, currentTime, volume, isMuted, 
   hasNext, hasPrev, activeTab, onTabChange, 
   onTogglePlay, onNext, onPrev, onSeek, 
   onVolumeChange, onMuteToggle, onMinimize, 
   onClose, formatTime 
 }) { 
   return ( 
     <div className=" 
       w-[340px] md:w-[380px] 
       bg-card/98 backdrop-blur-2xl 
       border border-border 
       rounded-2xl 
       shadow-2xl shadow-black/60 
       overflow-hidden 
       max-h-[85vh] md:max-h-[80vh] 
       flex flex-col 
     "> 
 
       {/* ━━━ Pull Handle (Mobile Only) ━━━ */}
       <div className="md:hidden flex justify-center pt-2 pb-1 bg-card/50">
         <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
       </div>

      {/* ━━━ Header ━━━ */} 
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50"> 
        <div className="flex gap-1 overflow-x-auto no-scrollbar"> 
          {[ 
            { id: 'player', icon: Music, label: 'Player' }, 
            { id: 'search', icon: Search, label: 'Search' }, 
            { id: 'queue', icon: ListMusic, label: 'Queue' } 
          ].map(tab => ( 
            <button 
              key={tab.id} 
              onClick={() => onTabChange(tab.id)} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg 
                          text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${ 
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent' 
              }`} 
            > 
              <tab.icon className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'queue' && <span className="sm:hidden">Queue</span>}
              {tab.id === 'search' && <span className="sm:hidden">Search</span>}
              {tab.id === 'player' && <span className="sm:hidden">Now</span>}
            </button> 
          ))} 
        </div> 
        <div className="flex gap-2 items-center flex-shrink-0 ml-2"> 
          {isPlaying && activeTab !== 'player' && (
            <Badge variant="secondary" className="hidden sm:flex bg-primary/10 text-primary border-none animate-pulse text-[9px] px-1.5 py-0">
              PLAYING
            </Badge>
          )}
          <div className="flex items-center gap-0.5">
            <button onClick={onMinimize} 
                    className="w-9 h-9 rounded-full hover:bg-accent flex items-center justify-center transition-all active:scale-90"
                    title="Minimize"> 
              <ChevronDown className="w-5 h-5 text-muted-foreground" /> 
            </button> 
            <button onClick={onClose} 
                    className="w-9 h-9 rounded-full hover:bg-destructive/10 group flex items-center justify-center transition-all active:scale-90"
                    title="Close"> 
              <X className="w-5 h-5 text-muted-foreground group-hover:text-destructive" /> 
            </button> 
          </div>
        </div> 
      </div>

       {/* ━━━ Tab Content ━━━ */} 
       <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-transparent to-black/5"> 
 
         {activeTab === 'player' && ( 
           <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center min-h-0"> 
             {/* Album art */} 
             <div className="aspect-square w-full max-w-[200px] sm:max-w-[280px] md:max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-accent 
                             flex items-center justify-center relative shadow-2xl group/art flex-shrink-0 transition-all duration-500 hover:shadow-primary/20">
               {currentSong?.thumbnail ? (
                 <img
                   src={currentSong.thumbnail.replace('default.jpg', 'hqdefault.jpg')}
                   alt={currentSong.title}
                   className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-700"
                 />
               ) : (
                 <Music className="w-16 h-16 text-muted-foreground opacity-20" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
               {isBuffering && (
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                   <div className="w-10 h-10 border-3 border-primary/30 border-t-primary
                                   rounded-full animate-spin" />
                 </div>
               )}
             </div>

             {/* Song info */} 
             <div className="text-center space-y-1 sm:space-y-2 flex-shrink-0 py-2"> 
               <p className="font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl truncate px-2 tracking-tighter leading-none">{currentSong?.title || 'No song selected'}</p> 
               <p className="text-sm sm:text-base md:text-lg text-muted-foreground truncate px-4 font-bold opacity-60"> 
                 {currentSong?.channel || 'Search for a song'} 
               </p> 
             </div> 
 
            {/* Progress bar */} 
            <div className="space-y-3 px-4 flex-shrink-0"> 
              <div 
                className="h-2.5 bg-accent/40 rounded-full cursor-pointer group relative overflow-visible shadow-inner" 
                onClick={(e) => { 
                  const rect = e.currentTarget.getBoundingClientRect() 
                  const ratio = (e.clientX - rect.left) / rect.width 
                  onSeek(ratio * duration) 
                }} 
              > 
                <div 
                  className="h-full bg-primary rounded-full relative group-hover:bg-primary/90 
                             transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                  style={{ width: `${progress}%` }} 
                > 
                </div>
                {/* Scrubber dot */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full 
                             opacity-0 group-hover:opacity-100 transition-all shadow-2xl pointer-events-none z-10 scale-0 group-hover:scale-100" 
                  style={{ left: `calc(${progress}% - 10px)` }}
                /> 
              </div> 
              <div className="flex justify-between text-[12px] text-muted-foreground font-black font-mono tracking-tighter opacity-70"> 
                <span>{formatTime(currentTime)}</span> 
                <span>{formatTime(duration)}</span> 
              </div> 
            </div> 
 
             {/* Controls */} 
             <div className="flex items-center justify-center gap-6 sm:gap-10 py-2 sm:py-4 flex-shrink-0"> 
               <button 
                 onClick={onPrev} 
                 disabled={!hasPrev} 
                 className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full 
                            hover:bg-accent transition-all disabled:opacity-20 active:scale-90 text-muted-foreground hover:text-foreground" 
               > 
                 <SkipBack className="w-6 h-6 sm:w-8 sm:h-8 fill-current" /> 
               </button> 
 
               <button 
                 onClick={onTogglePlay} 
                 disabled={!currentSong} 
                 className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary text-primary-foreground 
                            flex items-center justify-center 
                            hover:scale-105 active:scale-95 transition-all 
                            shadow-[0_10px_40px_rgba(var(--primary-rgb),0.4)] disabled:opacity-50" 
               > 
                 {isBuffering ? ( 
                   <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-primary-foreground/30 
                                   border-t-primary-foreground rounded-full animate-spin" /> 
                 ) : isPlaying ? ( 
                   <Pause className="w-10 h-10 sm:w-12 sm:h-12 fill-current" /> 
                 ) : ( 
                   <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-current ml-1.5" /> 
                 )} 
               </button> 
 
               <button 
                 onClick={onNext} 
                 disabled={!hasNext} 
                 className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full 
                            hover:bg-accent transition-all disabled:opacity-20 active:scale-90 text-muted-foreground hover:text-foreground" 
               > 
                 <SkipForward className="w-6 h-6 sm:w-8 sm:h-8 fill-current" /> 
               </button> 
             </div> 
 
             {/* Volume */} 
             <div className="flex items-center gap-4 pt-4 sm:pt-6 px-4 flex-shrink-0"> 
               <button 
                 onClick={onMuteToggle} 
                 className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors" 
               > 
                 {isMuted || volume === 0 
                   ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> 
                   : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> 
                 } 
               </button> 
               <div className="flex-1 px-1">
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={isMuted ? 0 : volume} 
                   onChange={(e) => onVolumeChange(Number(e.target.value))} 
                   className="w-full h-1.5 accent-primary cursor-pointer bg-accent rounded-full appearance-none hover:bg-accent-foreground/10 transition-colors shadow-inner" 
                   style={{ accentColor: 'hsl(var(--primary))' }} 
                 /> 
               </div>
               <span className="text-[11px] sm:text-[12px] text-muted-foreground w-10 sm:w-12 text-right font-black font-mono opacity-60 tracking-tighter"> 
                 {isMuted ? '0' : volume}% 
               </span> 
             </div> 
           </div> 
         )} 
 
         {activeTab === 'search' && <MusicSearch />} 
 
         {activeTab === 'queue' && <MusicQueue />} 
       </div> 
     </div> 
   ) 
 } 
