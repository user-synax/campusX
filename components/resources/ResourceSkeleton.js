"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * ResourceSkeleton Component
 * Loading state placeholder for ResourceCard.
 */
export default function ResourceSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/20 backdrop-blur-sm shadow-md animate-pulse"> 
      {/* Category color bar placeholder */}
      <div className="h-1 shrink-0 bg-accent/20" /> 
 
      <div className="p-4 space-y-4"> 
        {/* Header */} 
        <div className="flex items-start justify-between gap-2"> 
          <div className="flex-1 min-w-0"> 
            {/* Badges placeholder */} 
            <div className="flex items-center gap-1.5 mb-2.5"> 
              <Skeleton className="h-4 w-16 rounded-full" /> 
              <Skeleton className="h-4 w-12 rounded-md" /> 
            </div> 
 
            {/* Title placeholder */} 
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full rounded" /> 
              <Skeleton className="h-4 w-3/4 rounded" /> 
            </div>
 
            {/* Subject placeholder */} 
            <div className="flex items-center gap-1.5 mt-2">
              <Skeleton className="h-3 w-20 rounded" /> 
              <Skeleton className="h-3 w-16 rounded" /> 
            </div>
          </div> 
 
          {/* File size placeholder */} 
          <Skeleton className="h-3 w-10 rounded" /> 
        </div> 
 
        {/* Tags placeholder */} 
        <div className="flex flex-wrap gap-1"> 
          <Skeleton className="h-3.5 w-12 rounded-md" /> 
          <Skeleton className="h-3.5 w-14 rounded-md" /> 
          <Skeleton className="h-3.5 w-10 rounded-md" /> 
        </div> 
 
        {/* Uploader info placeholder */} 
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/50"> 
          <Skeleton className="h-6 w-6 rounded-full" /> 
          <div className="flex-1 min-w-0"> 
            <Skeleton className="h-3 w-20 rounded mb-1" /> 
            <Skeleton className="h-2.5 w-24 rounded" /> 
          </div> 
          
          {/* Stats placeholder */} 
          <div className="flex items-center gap-2"> 
            <Skeleton className="h-3 w-8 rounded" /> 
            <Skeleton className="h-3 w-8 rounded" /> 
          </div> 
        </div> 
 
        {/* Action buttons placeholder */} 
        <div className="flex gap-2 pt-1"> 
          <Skeleton className="h-9 flex-1 rounded-xl" /> 
          <Skeleton className="h-9 w-10 rounded-xl" /> 
          <Skeleton className="h-9 w-10 rounded-xl" /> 
        </div> 
      </div> 
    </Card> 
  )
}
