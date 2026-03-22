"use client"

import { useYouTubeSearch } from '@/hooks/useYouTubeSearch'
import { useMusic } from '@/contexts/MusicContext'
import { Search, Music, Plus, Play, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function MusicSearch() {
  const { query, setQuery, debouncedQuery, results, loading, error, search } = useYouTubeSearch()
  const { playSong, addToQueue } = useMusic()

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
    }
  }, [debouncedQuery, search])

  return (
    <div className="flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full bg-accent border-none rounded-xl py-3 sm:py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-1.5 pr-1 custom-scrollbar overscroll-contain touch-pan-y">
        {results.length > 0 ? (
          results.map((song) => (
            <div 
              key={song.videoId}
              className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300"
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm border border-border/50">
                <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button 
                  onClick={() => playSong(song)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[1px]"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                    <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
                  </div>
                </button>
              </div>
              <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                <p className="text-[13px] sm:text-[14px] font-bold truncate leading-tight tracking-tight mb-0.5">{song.title}</p>
                <p className="text-[11px] sm:text-[12px] text-muted-foreground truncate opacity-70 font-bold">{song.channel}</p>
              </div>
              <button 
                onClick={() => addToQueue(song)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
                title="Add to queue"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : query.length >= 2 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Music className="w-12 h-12 mb-2" />
            <p className="text-sm">No songs found</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Search className="w-12 h-12 mb-2" />
            <p className="text-sm">Search for music</p>
          </div>
        )}
      </div>
      
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
