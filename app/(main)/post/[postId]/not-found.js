"use client"

import Link from 'next/link'
import { FileX, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

/**
 * Custom not-found page for posts.
 */
export default function PostNotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10 flex items-center gap-3">
        <Link href="/feed">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="font-bold">Post Not Found</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <FileX className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">This post no longer exists</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            The post you&apos;re looking for may have been deleted by the author or never existed.
          </p>
        </div>

        <Link href="/feed">
          <Button className="mt-4 rounded-full px-8">
            Back to Feed
          </Button>
        </Link>
      </div>
    </div>
  )
}
