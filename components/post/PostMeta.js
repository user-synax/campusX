import { memo } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import FormattedTime from "@/components/shared/FormattedTime"
import { isFounder } from "@/lib/founder"
import FounderBadges from "@/components/founder/FounderBadges"

const PostMeta = memo(function PostMeta({
  author,
  createdAt,
  community
}) {

  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <Link
        href={`/profile/${author.username}`}
        className="hover:underline flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-bold text-foreground">{author.name}</span>
      </Link>
      <span className="text-muted-foreground truncate">@{author.username}</span>
      <span className="text-muted-foreground">·</span>
      <Link 
        href={`/post/${createdAt._id || ''}`} 
        className="text-muted-foreground hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <FormattedTime date={createdAt} />
      </Link>
      {community && (
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border bg-secondary/30">
          🎓 {community}
        </Badge>
      )}
    </div>
  )
})

export { PostMeta }
