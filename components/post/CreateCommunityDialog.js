"use client"

import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

export default function CreateCommunityDialog({ trigger, onCreated }) {
  const [collegeName, setCollegeName] = useState('')
  const [firstPost, setFirstPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!collegeName.trim() || !firstPost.trim()) {
      toast.error('Both college name and a first post are required')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: firstPost,
          community: collegeName,
          isAnonymous: false
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create community')
      }

      toast.success(`Community "${collegeName}" created!`)
      setOpen(false)
      setCollegeName('')
      setFirstPost('')
      
      // Refresh to show the new community
      router.refresh()
      onCreated?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            Create Community
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
          <DialogDescription>
            Register your college on CampusX by making the first post.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="college">College Name</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="college"
                placeholder="e.g. IIT Delhi, Stanford University"
                className="pl-9 bg-accent/20 border-border"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="post">First Post</Label>
            <Textarea
              id="post"
              placeholder="Say something to start the conversation..."
              className="resize-none bg-accent/20 border-border min-h-[100px]"
              value={firstPost}
              onChange={(e) => setFirstPost(e.target.value)}
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {firstPost.length}/500
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreate} 
            disabled={isLoading || !collegeName.trim() || !firstPost.trim()}
            className="w-full rounded-full"
          >
            {isLoading ? 'Creating...' : 'Create & Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
