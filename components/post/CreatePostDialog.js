"use client"

import { useState } from 'react'
import { PlusSquare, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import PostComposer from "@/components/post/PostComposer"

export default function CreatePostDialog({ trigger, onPostCreated }) {
  const [open, setOpen] = useState(false)

  const handlePostCreated = (newPost) => {
    setOpen(false)
    if (onPostCreated) onPostCreated(newPost)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="w-12 h-12 text-primary">
            <PlusSquare className="w-6 h-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border h-[100dvh] sm:h-auto sm:rounded-xl flex flex-col">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold">Create Post</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <PostComposer onPostCreated={handlePostCreated} noBorder />
        </div>
      </DialogContent>
    </Dialog>
  )
}
