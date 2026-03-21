"use client"

import { useState } from 'react'
import Link from 'next/link'
import { renderContentWithHashtags } from "@/utils/hashtags"

export default function PostContent({ content }) {
  const TRUNCATE_LENGTH = 300 // chars shown in feed before "read more"
  const [expanded, setExpanded] = useState(false)

  if (!content) return null

  const shouldTruncate = content.length > TRUNCATE_LENGTH
  const displayContent = expanded || !shouldTruncate
    ? content
    : content.slice(0, TRUNCATE_LENGTH)

  return (
    <div>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-normal text-foreground">
        {renderContentWithHashtags(displayContent).map((segment, i) => (
          segment.type === 'hashtag' ? (
            <Link 
              key={i} 
              href={`/hashtag/${segment.value}`}
              className="text-blue-400 hover:text-blue-300 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              #{segment.value}
            </Link>
          ) : (
            <span key={i}>{segment.value}</span>
          )
        ))}
        {!expanded && shouldTruncate && '...'}
      </p>

      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          className="text-primary text-sm mt-1 hover:underline font-medium"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
