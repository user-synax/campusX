"use client" 
  
 /**
  * Manages YouTube IFrame Player lifecycle. 
  * Player is created ONCE and reused — not recreated on each song. 
  * Script loaded ONCE — subsequent calls reuse window.YT. 
  */
  
 import { useState, useEffect, useRef, useCallback } from 'react' 
  
 // Global promise — ensures YT script loads only once 
 let ytApiPromise = null 
  
 function loadYouTubeAPI() { 
   if (ytApiPromise) return ytApiPromise 
  
   ytApiPromise = new Promise((resolve) => { 
     // Already loaded 
     if (window.YT?.Player) { 
       resolve(window.YT) 
       return 
     } 
  
     // Set up callback before loading script 
     window.onYouTubeIframeAPIReady = () => { 
       resolve(window.YT) 
     } 
  
     // Load script — only once ever 
     const script = document.createElement('script') 
     script.src = 'https://www.youtube.com/iframe_api' 
     script.async = true 
     document.head.appendChild(script) 
   }) 
  
   return ytApiPromise 
 } 
  
 export function useYouTubePlayer(containerRef) { 
   const playerRef = useRef(null) 
   const [playerReady, setPlayerReady] = useState(false) 
   const [playerState, setPlayerState] = useState(-1) 
   // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued 
   const [currentVideoId, setCurrentVideoId] = useState(null) 
   const [duration, setDuration] = useState(0) 
   const [currentTime, setCurrentTime] = useState(0) 
   const [volume, setVolume] = useState(80) 
   const timeIntervalRef = useRef(null) 
  
   // Initialize player — called when player container is mounted 
   const initPlayer = useCallback(async (videoId) => { 
     if (!containerRef.current) return 
  
     const YT = await loadYouTubeAPI() 
  
     // Destroy existing player if any 
     if (playerRef.current) { 
       playerRef.current.destroy() 
       playerRef.current = null 
     } 
  
     playerRef.current = new YT.Player(containerRef.current, { 
       videoId, 
       width: '100%', 
       height: '100%', 
       playerVars: { 
         autoplay: 1,        // auto play on load 
         controls: 0,        // hide YouTube controls (we make our own) 
         disablekb: 1,       // disable keyboard shortcuts 
         fs: 0,              // disable fullscreen 
         iv_load_policy: 3,  // hide annotations 
         modestbranding: 1,  // minimal YouTube branding 
         playsinline: 1,     // play inline on iOS (not fullscreen) 
         rel: 0,             // don't show related videos 
         origin: window.location.origin 
       }, 
       events: { 
         onReady: (event) => { 
           setPlayerReady(true) 
           event.target.setVolume(volume) 
           setDuration(event.target.getDuration()) 
         }, 
         onStateChange: (event) => { 
           setPlayerState(event.data) 
  
           // Track ended → auto-play next (handled in MusicPlayer) 
           if (event.data === YT.PlayerState.PLAYING) { 
             startTimeTracking() 
             setDuration(event.target.getDuration()) 
           } else { 
             stopTimeTracking() 
           } 
         }, 
         onError: (event) => { 
           console.error('[YT Player] Error:', event.data) 
           // Error codes: 2=invalid id, 5=HTML5 error, 100=not found 
           // 101/150=not embeddable 
           stopTimeTracking() 
         } 
       } 
     }) 
  
     setCurrentVideoId(videoId) 
   }, [volume, containerRef]) 
  
   // Load a new video into existing player (faster than re-init) 
   const loadVideo = useCallback((videoId) => { 
     if (!playerRef.current || !playerReady) { 
       initPlayer(videoId) 
       return 
     } 
     playerRef.current.loadVideoById(videoId) 
     setCurrentVideoId(videoId) 
   }, [playerReady, initPlayer]) 
  
   // Playback controls 
  const play = useCallback(() => { 
    if (!playerReady || !playerRef.current) return
    playerRef.current.playVideo() 
  }, [playerReady]) 
 
  const pause = useCallback(() => { 
    if (!playerReady || !playerRef.current) return
    playerRef.current.pauseVideo() 
  }, [playerReady]) 
 
  const togglePlay = useCallback(() => { 
    if (!playerReady || !playerRef.current) return 
    if (playerState === 1) { 
      playerRef.current.pauseVideo() 
    } else { 
      playerRef.current.playVideo() 
    } 
  }, [playerReady, playerState]) 
 
  const seekTo = useCallback((seconds) => { 
    if (!playerReady || !playerRef.current) return
    playerRef.current.seekTo(seconds, true) 
    setCurrentTime(seconds) 
  }, [playerReady]) 
 
  const changeVolume = useCallback((vol) => { 
    setVolume(vol) 
    if (playerReady && playerRef.current) {
      playerRef.current.setVolume(vol) 
    }
  }, [playerReady]) 
 
  const mute = useCallback(() => { 
    if (playerReady && playerRef.current) {
      playerRef.current.mute() 
    }
  }, [playerReady]) 
 
  const unmute = useCallback(() => { 
    if (playerReady && playerRef.current) {
      playerRef.current.unMute() 
    }
  }, [playerReady]) 
  
   // Time tracking for progress bar 
   function startTimeTracking() { 
     stopTimeTracking() 
     timeIntervalRef.current = setInterval(() => { 
       if (playerRef.current?.getCurrentTime) { 
         setCurrentTime(playerRef.current.getCurrentTime()) 
       } 
     }, 1000) 
   } 
  
   function stopTimeTracking() { 
     if (timeIntervalRef.current) { 
       clearInterval(timeIntervalRef.current) 
       timeIntervalRef.current = null 
     } 
   } 
  
   // Cleanup on unmount 
   useEffect(() => { 
     return () => { 
       stopTimeTracking() 
       // Don't destroy player on unmount — we want music to continue 
       // Player will be destroyed when new song is loaded 
     } 
   }, []) 
  
   const isPlaying = playerState === 1 
   const isBuffering = playerState === 3 
   const isEnded = playerState === 0 
  
   return { 
     playerReady, 
     isPlaying, 
     isBuffering, 
     isEnded, 
     currentVideoId, 
     duration, 
     currentTime, 
     volume, 
     initPlayer, 
     loadVideo, 
     play, 
     pause, 
     togglePlay, 
     seekTo, 
     changeVolume, 
     mute, 
     unmute 
   } 
 } 
