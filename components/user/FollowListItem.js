"use client"

import Link from "next/link"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"

export default function FollowListItem({ user, currentUserId, isOwnProfile, onClose }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"> 
      <Link 
        href={`/profile/${user.username}`} 
        onClick={onClose} 
        className="flex items-center gap-3 flex-1 min-w-0" 
      > 
        <UserAvatar user={user} size="md" /> 
        <div className="min-w-0"> 
          <div className="flex items-center gap-1"> 
            <p className="font-medium text-sm truncate text-foreground">{user.name}</p> 
            {user.isVerified && (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"> 
                <circle cx="12" cy="12" r="12" fill="#3b82f6" /> 
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" 
                  strokeLinecap="round" strokeLinejoin="round" fill="none" /> 
              </svg>
            )} 
          </div> 
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p> 
          {user.college && ( 
            <p className="text-xs text-muted-foreground truncate mt-0.5">🎓 {user.college}</p> 
          )} 
        </div> 
      </Link> 
    
      {/* Follow button — don't show for own profile */} 
      {!isOwnProfile && currentUserId && ( 
        <FollowButton 
          targetUserId={user._id} 
          username={user.username}
          initialIsFollowing={user.isFollowedByCurrentUser} 
          initialFollowersCount={user.followersCount || 0} 
          compact={true} 
        /> 
      )} 
    
      {/* "You" badge for own account */} 
      {isOwnProfile && ( 
        <span className="text-[10px] font-bold text-muted-foreground border border-border px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/50"> 
          You 
        </span> 
      )} 
    </div>
  )
}
