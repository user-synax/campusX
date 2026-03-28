"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { MapPin, X, BarChart2, Link2, Loader2, ImagePlus, FileCode, Eye, Edit3 } from 'lucide-react'
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
import MarkdownRenderer from "@/components/shared/MarkdownRenderer"
import { cn } from "@/lib/utils"
import { containsMarkdown } from "@/utils/markdown"
import useUser from "@/hooks/useUser"
import { useDebounce } from "@/hooks/useDebounce"
import { useUploadThing } from "@/lib/uploadthing"

export default function PostComposer({ onPostCreated, defaultCommunity, noBorder = false }) {
  const { user: currentUser } = useUser()
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [manualCommunity, setManualCommunity] = useState('')
  const [showPoll, setShowPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])

  // Markdown state
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false)

  // Image state
  const [selectedImages, setSelectedImages] = useState([]) // File[]
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const markdownFileInputRef = useRef(null)

  const { startUpload } = useUploadThing('postImageUploader')

  // Link preview state
  const [linkPreview, setLinkPreview] = useState(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const debouncedContent = useDebounce(content, 800)

  // Detect and fetch link preview
  useEffect(() => {
    // Improved regex to avoid trailing punctuation like ) or .
    const urlRegex = /(https?:\/\/[^\s)]+)/g
    const match = debouncedContent.match(urlRegex)
    let url = match ? match[0] : null

    // Clean up trailing dots or commas often typed at end of sentence
    if (url) {
      url = url.replace(/[.,;!]+$/, '')
    }

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

  const getCounterColor = (len) => { 
    if (len > 2000) return 'text-destructive font-bold' 
    if (len > 1900) return 'text-orange-400' 
    if (len > 1600) return 'text-yellow-400' 
    return 'text-muted-foreground' 
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = 6 - selectedImages.length
    if (files.length > remaining) {
      toast.error(`Maximum 6 images allowed`, {
        description: `You can only add ${remaining} more image${remaining === 1 ? '' : 's'}.`,
      })
    }
    const accepted = files.slice(0, remaining)
    if (accepted.length) {
      setSelectedImages(prev => [...prev, ...accepted])
    }
    // Reset input so the same file can be re-selected if removed
    e.target.value = ''
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Handle markdown file import
  const handleMarkdownFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast.error('Please select a .md or .txt file')
      e.target.value = ''
      return
    }

    if (file.size > 50 * 1024) { // 50KB limit
      toast.error('File too large (max 50KB)')
      e.target.value = ''
      return
    }

    try {
      const text = await file.text()
      setContent(text)
      toast.success('Markdown file loaded!')
    } catch (err) {
      toast.error('Failed to read file')
    }
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!content.trim() || content.length > 2000) return

    // Poll validation
    if (showPoll) {
      if (!pollOptions[0].trim() || !pollOptions[1].trim()) {
        toast.error("Poll needs at least 2 options", {
          description: "Please fill in the first two options.",
        })
        return
      }
    }

    // Upload images first if any are selected
    let uploadedImageUrls = []
    if (selectedImages.length > 0) {
      setIsUploading(true)
      try {
        const results = await startUpload(selectedImages)
        if (!results || results.length === 0) {
          throw new Error('Upload returned no results')
        }
        uploadedImageUrls = results.map(r => r.url)
      } catch (err) {
        toast.error("Image upload failed", {
          description: "Please try again. Your post content has been preserved.",
        })
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    // Detect if content is markdown
    const containsMd = containsMarkdown(content)

    const payload = {
      content,
      community: defaultCommunity || manualCommunity,
      isAnonymous,
      poll: showPoll ? pollOptions.filter(o => o.trim()) : null,
      images: uploadedImageUrls,
      linkPreview: linkPreview ? {
        title: linkPreview.title,
        description: linkPreview.description,
        image: linkPreview.image,
        url: linkPreview.url
      } : null,
      isMarkdown: containsMd
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
      setSelectedImages([])
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
          {/* Markdown preview/edit toggle */}
          {content && (
            <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
              <button
                onClick={() => setIsMarkdownPreview(false)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  !isMarkdownPreview
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => setIsMarkdownPreview(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  isMarkdownPreview
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>
          )}

          {/* Edit mode */}
          {!isMarkdownPreview && (
            <Textarea
              placeholder="What's happening on campus? (Supports **markdown**)"
              className="resize-none border-none bg-transparent text-lg focus-visible:ring-0 p-0 min-h-25 font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          )}

          {/* Preview mode */}
          {isMarkdownPreview && (
            <div 
              className="min-h-25 cursor-pointer"
              onClick={() => setIsMarkdownPreview(false)}
            >
              {content ? (
                <MarkdownRenderer content={content} className="text-lg" />
              ) : (
                <p className="text-muted-foreground">Nothing to preview...</p>
              )}
            </div>
          )}

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
                  <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-secondary relative overflow-hidden">
                    <img 
                      src={linkPreview.image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
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

          {/* Image Preview Strip */}
          {selectedImages.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {selectedImages.map((file, i) => (
                <div key={i} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-accent/20 group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
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

                {/* Image attachment button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-2 sm:px-3 transition-colors",
                    selectedImages.length > 0 ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 6}
                >
                  <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {selectedImages.length > 0 ? (
                    <span className="text-[10px] sm:text-xs">{selectedImages.length}/6</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs">Photo</span>
                  )}
                </Button>

                {/* Markdown file attachment button */}
                <input
                  ref={markdownFileInputRef}
                  type="file"
                  accept=".md,.txt"
                  className="hidden"
                  onChange={handleMarkdownFileSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-2 sm:px-3 transition-colors",
                    "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => markdownFileInputRef.current?.click()}
                >
                  <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Markdown</span>
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
              <span className={`text-[10px] sm:text-xs tabular-nums font-medium ${getCounterColor(content.length)}`}>
                {content.length}/2000
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > 2000 || isLoading || isUploading}
                size="sm"
                className="rounded-full px-4 sm:px-5 text-xs sm:text-sm h-8 sm:h-9"
              >
                {isUploading ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-1" />Uploading...</>
                ) : isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
