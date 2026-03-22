"use client" 
 
 import { 
   createContext, useContext, 
   useState, useCallback, 
   useEffect 
 } from 'react' 
 
 const MusicContext = createContext(null) 
 
 // How many songs to keep in queue 
 const MAX_QUEUE_SIZE = 50 
 
 export function MusicProvider({ children }) { 
 
   // ━━━ Core State ━━━ 
   const [currentSong, setCurrentSong] = useState(null) 
   // { videoId, title, channel, thumbnail } 
 
   const [queue, setQueue] = useState([]) 
   // Array of song objects 
 
   const [queueIndex, setQueueIndex] = useState(-1) 
   // Current position in queue 
 
   const [isPlayerOpen, setIsPlayerOpen] = useState(false) 
   // Whether floating player is visible 
 
   const [isMinimized, setIsMinimized] = useState(true) 
   // true = mini player, false = expanded player 
 
   const [isPlayerMounted, setIsPlayerMounted] = useState(false) 
   // Only mount player DOM after first interaction 
 
   // ━━━ Restore from localStorage ━━━ 
   useEffect(() => { 
     try { 
       const saved = localStorage.getItem('cx_music_last') 
       if (saved) { 
         const { song, queue: savedQueue, index } = JSON.parse(saved) 
         if (song?.videoId) { 
           setCurrentSong(song) 
           setQueue(savedQueue || [song]) 
           setQueueIndex(index || 0) 
         } 
       } 
     } catch (err) {
       console.error('[MusicContext] Error restoring state:', err)
     } 
   }, []) 
 
   // ━━━ Save to localStorage ━━━ 
   useEffect(() => { 
     if (!currentSong) return 
     try { 
       localStorage.setItem('cx_music_last', JSON.stringify({ 
         song: currentSong, 
         queue, 
         index: queueIndex 
       })) 
     } catch (err) {
       // Silent fail for localStorage quota or other issues
     } 
   }, [currentSong, queue, queueIndex]) 
 
   // ━━━ Play a song ━━━ 
   const playSong = useCallback((song, addToQueue = true) => { 
     setCurrentSong(song) 
     setIsPlayerOpen(true) 
     setIsPlayerMounted(true) 
 
     if (addToQueue) { 
       setQueue(prev => { 
         // Don't add duplicate if already in queue 
         const exists = prev.findIndex(s => s.videoId === song.videoId) 
         if (exists !== -1) { 
           setQueueIndex(exists) 
           return prev 
         } 
         // Add to end, respect max size 
         const newQueue = [...prev, song].slice(-MAX_QUEUE_SIZE) 
         setQueueIndex(newQueue.length - 1) 
         return newQueue 
       }) 
     } 
   }, []) 
 
   // ━━━ Play next in queue ━━━ 
   const playNext = useCallback(() => { 
     if (queue.length === 0) return 
     const nextIndex = (queueIndex + 1) % queue.length 
     setQueueIndex(nextIndex) 
     setCurrentSong(queue[nextIndex]) 
   }, [queue, queueIndex]) 
 
   // ━━━ Play previous ━━━ 
   const playPrev = useCallback(() => { 
     if (queue.length === 0) return 
     const prevIndex = queueIndex <= 0 
       ? queue.length - 1 
       : queueIndex - 1 
     setQueueIndex(prevIndex) 
     setCurrentSong(queue[prevIndex]) 
   }, [queue, queueIndex]) 
 
   // ━━━ Add to queue (without playing) ━━━ 
   const addToQueue = useCallback((song) => { 
     setQueue(prev => { 
       if (prev.find(s => s.videoId === song.videoId)) return prev 
       return [...prev, song].slice(-MAX_QUEUE_SIZE) 
     }) 
   }, []) 
 
   // ━━━ Remove from queue ━━━ 
   const removeFromQueue = useCallback((videoId) => { 
     setQueue(prev => { 
       const indexToRemove = prev.findIndex(s => s.videoId === videoId)
       if (indexToRemove === -1) return prev

       const newQueue = prev.filter(s => s.videoId !== videoId) 
       
       if (newQueue.length === 0) {
         setCurrentSong(null)
         setQueueIndex(-1)
         setIsPlayerOpen(false)
       } else if (indexToRemove === queueIndex) {
         // Current song removed, play next (or first if last was removed)
         const nextIdx = indexToRemove % newQueue.length
         setQueueIndex(nextIdx)
         setCurrentSong(newQueue[nextIdx])
       } else if (indexToRemove < queueIndex) {
         setQueueIndex(q => q - 1)
       }
       
       return newQueue 
     }) 
   }, [queueIndex]) 
 
   // ━━━ Clear queue ━━━ 
   const clearQueue = useCallback(() => { 
     setQueue([]) 
     setQueueIndex(-1) 
     setCurrentSong(null) 
     setIsPlayerOpen(false) 
     localStorage.removeItem('cx_music_last') 
   }, []) 
 
   // ━━━ Toggle player size ━━━ 
   const toggleMinimize = useCallback(() => { 
     setIsMinimized(prev => !prev) 
   }, []) 
 
   // ━━━ Close player ━━━ 
   const closePlayer = useCallback(() => { 
     setIsPlayerOpen(false) 
   }, []) 
 
   // ━━━ Open player (restore last song) ━━━ 
   const openPlayer = useCallback(() => { 
     setIsPlayerOpen(true) 
     setIsPlayerMounted(true) 
   }, []) 
 
   const hasNext = queue.length > 1 
   const hasPrev = queue.length > 1 
 
   return ( 
     <MusicContext.Provider value={{ 
       // State 
       currentSong, 
       queue, 
       queueIndex, 
       isPlayerOpen, 
       isMinimized, 
       isPlayerMounted, 
       hasNext, 
       hasPrev, 
 
       // Actions 
       playSong, 
       playNext, 
       playPrev, 
       addToQueue, 
       removeFromQueue, 
       clearQueue, 
       toggleMinimize, 
       closePlayer, 
       openPlayer 
     }}> 
       {children} 
     </MusicContext.Provider> 
   ) 
 } 
 
 export function useMusic() { 
   const ctx = useContext(MusicContext) 
   if (!ctx) throw new Error('useMusic must be used inside MusicProvider') 
   return ctx 
 } 
