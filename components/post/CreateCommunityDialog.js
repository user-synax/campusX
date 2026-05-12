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
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌐')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Community name is required')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emoji: emoji.trim(),
          description: description.trim()
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create community')
      }

      toast.success(`Community "${name}" created!`)
      setOpen(false)
      setName('')
      setEmoji('🌐')
      setDescription('')
      
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
            Start a new space for your interests, hobbies, or college.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="col-span-1 grid gap-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                placeholder="🌐"
                className="bg-accent/20 border-border text-center text-xl"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="col-span-3 grid gap-2">
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                placeholder="e.g. Coding, Designers, Memes"
                className="bg-accent/20 border-border"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this community about?"
              className="resize-none bg-accent/20 border-border min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {description.length}/200
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreate} 
            disabled={isLoading || !name.trim()}
            className="w-full rounded-full"
          >
            {isLoading ? 'Creating...' : 'Create Community'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
