"use client" 
  
 /**
  * Search YouTube directly from browser. 
  * Debounced + cached — minimal API quota usage. 
  */
  
 import { useState, useCallback, useRef } from 'react' 
 import { useDebounce } from '@/hooks/useDebounce' 
  
 const API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY 
  
 // In-memory search cache — survives component re-renders 
 // Key: search query, Value: results array 
 const searchCache = new Map() 
 const MAX_CACHE_SIZE = 50  // keep last 50 searches 
  
 export function useYouTubeSearch() { 
   const [query, setQuery] = useState('') 
   const [results, setResults] = useState([]) 
   const [loading, setLoading] = useState(false) 
   const [error, setError] = useState(null) 
   const abortRef = useRef(null) 
  
   const debouncedQuery = useDebounce(query, 300) 
  
   // Search function 
   const search = useCallback(async (searchQuery) => { 
     if (!searchQuery?.trim() || searchQuery.trim().length < 2) { 
       setResults([]) 
       return 
     } 
  
     const trimmed = searchQuery.trim() 
  
     // Check cache first — zero API call 
     if (searchCache.has(trimmed)) { 
       setResults(searchCache.get(trimmed)) 
       return 
     } 
  
     // Cancel previous request 
     if (abortRef.current) { 
       abortRef.current.abort() 
     } 
     abortRef.current = new AbortController() 
  
     setLoading(true) 
     setError(null) 
  
     try { 
       // Direct browser → YouTube API call 
       // NO Vercel function involved 
       const params = new URLSearchParams({ 
         part: 'snippet', 
         q: trimmed + ' song',  // append 'song' for better music results 
         type: 'video', 
         videoCategoryId: '10',   // Music category 
         maxResults: '10', 
         key: API_KEY, 
         fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/default)' 
         // fields param = only fetch what we need = save quota 
       }) 
  
       const res = await fetch( 
         `https://www.googleapis.com/youtube/v3/search?${params}`, 
         { signal: abortRef.current.signal } 
       ) 
  
       if (!res.ok) { 
         const data = await res.json().catch(() => ({}))
         if (res.status === 403 || data.error?.errors?.[0]?.reason === 'quotaExceeded') { 
           throw new Error('API quota exceeded. Try again tomorrow.') 
         } 
         throw new Error('Search failed. Try again.') 
       } 
  
       const data = await res.json() 
  
       // Parse results 
       const parsed = (data.items || []).map(item => ({ 
         videoId: item.id.videoId, 
         title: item.snippet.title 
           // Clean up HTML entities 
           .replace(/&amp;/g, '&') 
           .replace(/&quot;/g, '"') 
           .replace(/&#39;/g, "'")
           .replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>'), 
         channel: item.snippet.channelTitle, 
         thumbnail: item.snippet.thumbnails?.default?.url || '' 
       })) 
  
       // Cache the result 
       if (searchCache.size >= MAX_CACHE_SIZE) { 
         // Remove oldest entry 
         const firstKey = searchCache.keys().next().value 
         searchCache.delete(firstKey) 
       } 
       searchCache.set(trimmed, parsed) 
  
       setResults(parsed) 
  
     } catch (err) { 
       if (err.name === 'AbortError') return  // cancelled — no error 
       setError(err.message) 
       setResults([]) 
     } finally { 
       setLoading(false) 
     } 
   }, []) 
  
   // Auto-search when debounced query changes 
   // useEffect is handled by caller component 
   // to avoid double-mounting issues 
  
   const clearSearch = useCallback(() => { 
     setQuery('') 
     setResults([]) 
     setError(null) 
   }, []) 
  
   return { 
     query, 
     setQuery, 
     debouncedQuery, 
     results, 
     loading, 
     error, 
     search, 
     clearSearch 
   } 
 } 
