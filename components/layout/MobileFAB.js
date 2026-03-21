"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { useState } from "react"

const PostComposer = dynamic(() => import("@/components/post/PostComposer"), { ssr: false })

export default function MobileFAB() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Only show on feed, profile, or community pages
  const showFAB = ['/feed', '/community', '/profile'].some(path => pathname.startsWith(path))

  if (!showFAB) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="icon" 
            className="w-14 h-14 rounded-full shadow-2xl bg-white hover:text-white hover:bg-zinc-900 text-black hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-zinc-800"
          >
            <Plus className="w-8 h-8 stroke-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 sm:max-w-[525px] top-[15%] translate-y-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <PostComposer 
              noBorder 
              onPostCreated={() => {
                setOpen(false)
                // The feed will refresh via SSE or the onPostCreated callback in the page
                window.dispatchEvent(new CustomEvent('cx-post-created'))
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
