"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Globe, Loader2, Play, Eye, EyeOff, RefreshCw } from "lucide-react"

export default function LinkPreview({ url }) {
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(false)
  const [iframeFailed, setIframeFailed] = useState(false)

  const hostname = new URL(url).hostname
  const isYouTube = hostname.includes('youtube.com') || hostname.includes('youtu.be')

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/posts/preview?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data = await res.json()
          setMetadata(data)
        }
      } catch (err) {
        console.error("Metadata fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetadata()
  }, [url])

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const ytId = isYouTube ? getYouTubeId(url) : null

  if (loading) {
    return (
      <div className="my-3 border border-border rounded-xl p-4 bg-card/30 animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-2 bg-muted rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="my-3 border border-border rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm group hover:border-primary/30 transition-all cursor-pointer active:scale-[0.99]"
      onClick={(e) => {
        e.stopPropagation()
        window.open(url, '_blank', 'noopener,noreferrer')
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          <Globe className="w-3 h-3" />
          <span className="truncate max-w-[150px]">{hostname}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowIframe(!showIframe)
              if (!showIframe) setIframeLoading(true)
            }}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-[10px] font-bold ${
              showIframe ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            {showIframe ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showIframe ? 'CLOSE PREVIEW' : 'LIVE PREVIEW'}
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {!showIframe ? (
          /* Metadata Card */
          <div className="flex flex-col sm:flex-row gap-0 overflow-hidden min-h-[100px]">
            {metadata?.image && (
              <div className="w-full sm:w-40 h-40 sm:h-auto bg-muted shrink-0 relative overflow-hidden">
                <img 
                  src={metadata.image} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                {isYouTube && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="p-4 flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-bold text-sm line-clamp-2 leading-snug">
                {metadata?.title || hostname}
              </h4>
              {metadata?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Iframe Area (Live Preview) */
          <div 
            className="relative w-full aspect-video md:aspect-[21/9] bg-white overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Don't redirect if clicking inside live preview
          >
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-[10px] font-bold text-muted-foreground animate-pulse uppercase tracking-widest">
                  Loading Live View...
                </p>
              </div>
            )}

            {iframeFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-accent/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-primary opacity-70" />
                </div>
                <h4 className="text-sm font-bold truncate max-w-full px-4">{hostname}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Preview blocked by {hostname}.
                </p>
                <button 
                  onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  className="mt-4 px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:opacity-90 transition-all active:scale-95"
                >
                  VISIT WEBSITE
                </button>
              </div>
            ) : (
              <iframe
                src={ytId ? `https://www.youtube.com/embed/${ytId}` : url}
                className="w-full h-full border-none"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false)
                  setIframeFailed(true)
                }}
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="lazy"
              />
            )}
            
            {/* Overlay to prevent accidental clicks while scrolling (Not for YouTube) */}
            {!isYouTube && (
              <div className="absolute inset-0 z-0 pointer-events-none group-hover:pointer-events-auto" />
            )}
          </div>
        )}
      </div>

      {/* Footer / Status */}
      <div className="px-4 py-1.5 bg-muted/10 border-t border-border/50 flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground font-bold opacity-50 uppercase tracking-tighter">
          {showIframe ? (iframeFailed ? 'PREVIEW UNAVAILABLE' : 'LIVE VIEW ACTIVE') : 'SITE METADATA LOADED'}
        </p>
        {showIframe && !iframeFailed && (
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIframeLoading(true)
              // Force reload iframe
              const iframe = document.querySelector('iframe')
              if (iframe) iframe.src = iframe.src
            }}
            className="text-[9px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" /> RELOAD
          </button>
        )}
      </div>
    </div>
  )
}

