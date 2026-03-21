"use client"

import { useState, useEffect, useCallback } from 'react'
import { MapPin, X, BarChart2, Link2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import PollCreator from "@/components/post/PollCreator"
import { cn } from "@/lib/utils"
import useUser from "@/hooks/useUser"
import { useDebounce } from "@/hooks/useDebounce"

export default function PostComposer({ onPostCreated, defaultCommunity, noBorder = false }) {
  const { user: currentUser } = useUser()
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [manualCommunity, setManualCommunity] = useState('')
  const [showPoll, setShowPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])

  // Link preview state
  const [linkPreview, setLinkPreview] = useState(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const debouncedContent = useDebounce(content, 800)

  // Detect and fetch link preview
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const match = debouncedContent.match(urlRegex)
    const url = match ? match[0] : null

    if (url && (!linkPreview || linkPreview.originalUrl !== url)) {
      fetchPreview(url)
    } else if (!url) {
      setLinkPreview(null)
    }
  }, [debouncedContent])

  const fetchPreview = async (url) => {
    setIsPreviewLoading(true)
    try {
      const res = await fetch(`/api/posts/preview?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (res.ok) {
        setLinkPreview({ ...data, originalUrl: url })
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || content.length > 500) return

    // Poll validation
    if (showPoll) {
      if (!pollOptions[0].trim() || !pollOptions[1].trim()) {
        toast.error("Poll needs at least 2 options", {
          description: "Please fill in the first two options.",
        })
        return
      }
    }

    const payload = {
      content,
      community: defaultCommunity || manualCommunity,
      isAnonymous,
      poll: showPoll ? pollOptions.filter(o => o.trim()) : null,
      linkPreview: linkPreview ? {
        title: linkPreview.title,
        description: linkPreview.description,
        image: linkPreview.image,
        url: linkPreview.url
      } : null
    };

    setIsLoading(true)
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const newPost = await res.json()

      if (!res.ok) {
        throw new Error(newPost.message || 'Failed to create post')
      }

      setContent('')
      setIsAnonymous(false)
      setManualCommunity('')
      setShowTagInput(false)
      setShowPoll(false)
      setPollOptions(['', ''])
      setLinkPreview(null)
      if (onPostCreated) onPostCreated(newPost)
      
      toast.success("Posted!", {
        description: "Your post is live.",
      })
    } catch (error) {
      toast.error("Failed to post", {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "p-4 bg-background/50",
      !noBorder && "border-b border-border"
    )}>
      <div className="flex gap-3">
        <UserAvatar user={isAnonymous ? null : currentUser} size="md" />
        <div className="flex-1">
          <Textarea
            placeholder="What's happening on campus?"
            className="resize-none border-none bg-transparent text-lg focus-visible:ring-0 p-0 min-h-25"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />

          {/* Link Preview */}
          {isPreviewLoading && (
            <div className="mt-2 p-3 border border-border rounded-xl flex items-center gap-3 bg-accent/10 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Fetching link preview...</span>
            </div>
          )}

          {linkPreview && !isPreviewLoading && (
            <Card className="mt-2 overflow-hidden border-border bg-accent/10 group relative">
              <button 
                onClick={() => setLinkPreview(null)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
                {linkPreview.image && (
                  <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-secondary">
                    <img 
                      src={linkPreview.image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <Link2 className="w-3 h-3" />
                    <span className="truncate">{linkPreview.siteName || new URL(linkPreview.url).hostname}</span>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1 mb-1">{linkPreview.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {linkPreview.description}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Manual Tag Input */}
          {showTagInput && !defaultCommunity && (
            <div className="flex items-center gap-2 mt-2 bg-accent/30 p-2 rounded-lg border border-border animate-in fade-in slide-in-from-top-1">
              <MapPin className="w-4 h-4 text-primary" />
              <Input
                placeholder="Enter college name to tag or create..."
                className="h-8 text-sm bg-transparent border-none focus-visible:ring-0 p-0"
                value={manualCommunity}
                onChange={(e) => setManualCommunity(e.target.value)}
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={() => {
                  setShowTagInput(false)
                  setManualCommunity('')
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Poll Creator */}
          {showPoll && (
            <PollCreator 
              options={pollOptions} 
              onChange={setPollOptions} 
              onRemove={() => {
                setShowPoll(false)
                setPollOptions(['', ''])
              }}
            />
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t border-border gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-1">
                {defaultCommunity ? (
                  <Badge variant="secondary" className="gap-1 px-2 py-1 text-[10px] sm:text-xs">
                    📍 {defaultCommunity}
                  </Badge>
                ) : (
                  !showTagInput && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1.5 text-muted-foreground hover:text-primary rounded-full px-2 sm:px-3"
                      onClick={() => setShowTagInput(true)}
                    >
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs">Tag College</span>
                    </Button>
                  )
                )}

                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-2 sm:px-3 transition-colors",
                    showPoll ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setShowPoll(!showPoll)}
                >
                  <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Poll</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-0 sm:ml-2">
                <Switch 
                  id="anon-mode" 
                  checked={isAnonymous} 
                  onCheckedChange={setIsAnonymous} 
                  className="scale-75 sm:scale-100"
                />
                <Label htmlFor="anon-mode" className="cursor-pointer font-normal text-[10px] sm:text-xs">Anonymous</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
              <span className={`text-[10px] sm:text-xs font-medium ${content.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/500
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > 500 || isLoading}
                size="sm"
                className="rounded-full px-4 sm:px-5 text-xs sm:text-sm h-8 sm:h-9"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
