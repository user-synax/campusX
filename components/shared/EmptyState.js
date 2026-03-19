"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center px-4", className)}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        {Icon && <Icon className="w-6 h-6 text-muted-foreground" />}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionLabel && ( 
        <Button className="mt-4 rounded-full" onClick={onAction}>{actionLabel}</Button> 
      )} 
    </div>
  )
}
