"use client"

import { Link } from "lucide-react"

export default function LinkPreview({ url, clickable = true }) {
  const hostname = new URL(url).hostname.replace('www.', '')

  const content = (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
      <Link className="w-3.5 h-3.5" />
      <span className="font-medium">{hostname}</span>
    </div>
  )

  if (clickable) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block"
      >
        {content}
      </a>
    )
  }

  return content
}

