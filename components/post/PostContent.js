"use client"

import { useState } from 'react'
import Link from 'next/link'
import { renderContentWithMentions } from "@/utils/hashtags"
import UserMention from "@/components/shared/UserMention"

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
        {renderContentWithMentions(displayContent).map((segment, i) => {
          if (segment.type === 'hashtag') {
            return (
              <Link 
                key={i} 
                href={`/hashtag/${segment.value}`}
                className="text-blue-400 hover:text-blue-300 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                #{segment.value}
              </Link>
            )
          } else if (segment.type === 'mention') {
            return (
              <UserMention key={i} username={segment.value} />
            )
          } else {
            return <span key={i}>{segment.value}</span>
          }
        })}
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
