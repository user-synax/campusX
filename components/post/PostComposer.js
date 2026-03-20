"use client"

import { useState } from 'react'
import { MapPin, X, BarChart2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import PollCreator from "@/components/post/PollCreator"
import { cn } from "@/lib/utils"
import useUser from "@/hooks/useUser"

export default function PostComposer({ onPostCreated, defaultCommunity, noBorder = false }) {
  const { user: currentUser } = useUser()
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [manualCommunity, setManualCommunity] = useState('')
  const [showPoll, setShowPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])

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
      poll: showPoll ? pollOptions.filter(o => o.trim()) : null
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
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {defaultCommunity ? (
                  <Badge variant="secondary" className="gap-1 px-2 py-1">
                    📍 {defaultCommunity}
                  </Badge>
                ) : (
                  !showTagInput && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1.5 text-muted-foreground hover:text-primary rounded-full px-3"
                      onClick={() => setShowTagInput(true)}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Tag College</span>
                    </Button>
                  )
                )}

                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-3 transition-colors",
                    showPoll ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setShowPoll(!showPoll)}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-xs">Poll</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                <Switch 
                  id="anon-mode" 
                  checked={isAnonymous} 
                  onCheckedChange={setIsAnonymous} 
                />
                <Label htmlFor="anon-mode" className="cursor-pointer font-normal text-xs">Anonymous</Label>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${content.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/500
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > 500 || isLoading}
                size="sm"
                className="rounded-full px-5"
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
