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
       max-h-[80vh] 
       flex flex-col 
     "> 
 
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
         <div className="flex gap-1 flex-shrink-0 ml-2"> 
           {isPlaying && activeTab !== 'player' && (
             <Badge variant="secondary" className="hidden sm:flex bg-primary/10 text-primary border-none animate-pulse text-[9px] px-1.5 py-0">
               PLAYING
             </Badge>
           )}
           <button onClick={onMinimize} 
                   className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-all active:scale-90"> 
             <ChevronDown className="w-4 h-4 text-muted-foreground" /> 
           </button> 
           <button onClick={onClose} 
                   className="w-8 h-8 rounded-lg hover:bg-destructive/10 group flex items-center justify-center transition-all active:scale-90"> 
             <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive" /> 
           </button> 
         </div> 
       </div>

       {/* ━━━ Tab Content ━━━ */} 
       <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-transparent to-black/5"> 
 
         {activeTab === 'player' && ( 
           <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center min-h-0"> 
             {/* Album art */} 
             <div className="aspect-square w-full max-w-[200px] sm:max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-accent 
                             flex items-center justify-center relative shadow-2xl group/art flex-shrink-0">
               {currentSong?.thumbnail ? (
                 <img
                   src={currentSong.thumbnail.replace('default.jpg', 'mqdefault.jpg')}
                   alt={currentSong.title}
                   className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-700"
                 />
               ) : (
                 <Music className="w-16 h-16 text-muted-foreground opacity-20" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
               {isBuffering && (
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                   <div className="w-10 h-10 border-3 border-primary/30 border-t-primary
                                   rounded-full animate-spin" />
                 </div>
               )}
             </div>

             {/* Song info */} 
             <div className="text-center space-y-1 sm:space-y-2 flex-shrink-0"> 
               <p className="font-black text-lg sm:text-xl md:text-2xl truncate px-2 tracking-tight">{currentSong?.title || 'No song selected'}</p> 
               <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate px-4 font-medium opacity-80"> 
                 {currentSong?.channel || 'Search for a song'} 
               </p> 
             </div> 
 
             {/* Progress bar */} 
             <div className="space-y-2 sm:space-y-3 px-2 flex-shrink-0"> 
               <div 
                 className="h-1.5 sm:h-2 bg-accent/50 rounded-full cursor-pointer group relative overflow-visible" 
                 onClick={(e) => { 
                   const rect = e.currentTarget.getBoundingClientRect() 
                   const ratio = (e.clientX - rect.left) / rect.width 
                   onSeek(ratio * duration) 
                 }} 
               > 
                 <div 
                   className="h-full bg-primary rounded-full relative group-hover:bg-primary/90 
                              transition-all shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]" 
                   style={{ width: `${progress}%` }} 
                 > 
                 </div>
                 {/* Scrubber dot */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full 
                              opacity-0 group-hover:opacity-100 transition-all shadow-xl pointer-events-none z-10 scale-0 group-hover:scale-100" 
                   style={{ left: `calc(${progress}% - 8px)` }}
                 /> 
               </div> 
               <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-mono tracking-tight opacity-70"> 
                 <span>{formatTime(currentTime)}</span> 
                 <span>{formatTime(duration)}</span> 
               </div> 
             </div> 
 
             {/* Controls */} 
             <div className="flex items-center justify-center gap-4 sm:gap-8 py-1 sm:py-2 flex-shrink-0"> 
               <button 
                 onClick={onPrev} 
                 disabled={!hasPrev} 
                 className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full 
                            hover:bg-accent transition-all disabled:opacity-20 active:scale-90" 
               > 
                 <SkipBack className="w-5 h-5 sm:w-7 sm:h-7" /> 
               </button> 
 
               <button 
                 onClick={onTogglePlay} 
                 disabled={!currentSong} 
                 className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground 
                            flex items-center justify-center 
                            hover:scale-105 active:scale-95 transition-all 
                            shadow-2xl shadow-primary/40 disabled:opacity-50" 
               > 
                 {isBuffering ? ( 
                   <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-primary-foreground/30 
                                   border-t-primary-foreground rounded-full animate-spin" /> 
                 ) : isPlaying ? ( 
                   <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" /> 
                 ) : ( 
                   <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1.5" /> 
                 )} 
               </button> 
 
               <button 
                 onClick={onNext} 
                 disabled={!hasNext} 
                 className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full 
                            hover:bg-accent transition-all disabled:opacity-20 active:scale-90" 
               > 
                 <SkipForward className="w-5 h-5 sm:w-7 sm:h-7" /> 
               </button> 
             </div> 
 
             {/* Volume */} 
             <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-2 flex-shrink-0"> 
               <button 
                 onClick={onMuteToggle} 
                 className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors" 
               > 
                 {isMuted || volume === 0 
                   ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> 
                   : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                 } 
               </button> 
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={isMuted ? 0 : volume} 
                 onChange={(e) => onVolumeChange(Number(e.target.value))} 
                 className="flex-1 h-1 sm:h-1.5 accent-primary cursor-pointer bg-accent rounded-full appearance-none hover:bg-accent-foreground/10 transition-colors" 
                 style={{ accentColor: 'hsl(var(--primary))' }} 
               /> 
               <span className="text-[10px] sm:text-[11px] text-muted-foreground w-8 sm:w-10 text-right font-bold font-mono opacity-80"> 
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
