"use client"

import { useMusic } from '@/contexts/MusicContext'
import { ListMusic, Play, X, GripVertical } from 'lucide-react'

export default function MusicQueue() {
  const { 
    queue, currentSong, queueIndex, 
    playSong, removeFromQueue, clearQueue 
  } = useMusic()

  return (
    <div className="flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-primary" />
          Queue ({queue.length})
        </h3>
        {queue.length > 0 && (
          <button 
            onClick={clearQueue}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors uppercase font-bold tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar overscroll-contain touch-pan-y">
        {queue.length > 0 ? (
          queue.map((song, idx) => (
            <div 
              key={`${song.videoId}-${idx}`}
              className={`group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                currentSong?.videoId === song.videoId 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-accent border border-transparent'
              }`}
            >
              {/* Index or Play icon */}
              <div className="w-6 text-center text-[10px] font-mono text-muted-foreground group-hover:hidden">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => playSong(song)}
                className="hidden group-hover:flex w-6 h-6 items-center justify-center text-primary"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] sm:text-sm font-bold truncate tracking-tight ${
                  currentSong?.videoId === song.videoId ? 'text-primary' : ''
                }`}>
                  {song.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate opacity-60 font-bold">{song.channel}</p>
              </div>

              {/* Actions */}
              <button 
                onClick={() => removeFromQueue(song.videoId)}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                title="Remove from queue"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <ListMusic className="w-12 h-12 mb-2" />
            <p className="text-sm">Queue is empty</p>
            <p className="text-xs">Add some songs to start your playlist!</p>
          </div>
        )}
      </div>
    </div>
  )
}
