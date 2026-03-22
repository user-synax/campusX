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
    <div className="flex flex-col h-full overflow-hidden p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full bg-accent border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar overscroll-contain touch-pan-y">
        {results.length > 0 ? (
          results.map((song) => (
            <div 
              key={song.videoId}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => playSong(song)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Play className="w-5 h-5 text-white fill-current" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.channel}</p>
              </div>
              <button 
                onClick={() => addToQueue(song)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                title="Add to queue"
              >
                <Plus className="w-4 h-4" />
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
