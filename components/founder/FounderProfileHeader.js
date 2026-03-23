"use client"

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import { getDaysSinceLaunch, LAUNCH_DATE } from '@/lib/founder' 
import { formatCount } from '@/utils/formatters'
import { renderContentWithMentions } from "@/utils/hashtags"
import UserMention from "@/components/shared/UserMention"
import Link from 'next/link'
import FounderBadges from './FounderBadges'
import RoadmapWidget from './RoadmapWidget'
import FollowButton from '@/components/user/FollowButton'
import BroadcastManager from './BroadcastManager'
import AvatarWithFrame from '@/components/coins/AvatarWithFrame'
import CoinUsername from '@/components/coins/CoinUsername'
import CoinBadge from '@/components/coins/CoinBadge'

export default function FounderProfileHeader({ user, isOwnProfile, stats, onFollowClick }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="relative overflow-hidden border-b border-border"> 
      {/* Animated background — code rain / particle effect */} 
      <div className="absolute inset-0 overflow-hidden pointer-events-none"> 
        {/* Gradient mesh background */} 
        <div 
          className="absolute inset-0 opacity-30" 
          style={{ 
            background: ` 
              radial-gradient(ellipse at 20% 50%, #f59e0b22 0%, transparent 60%), 
              radial-gradient(ellipse at 80% 50%, #8b5cf622 0%, transparent 60%), 
              radial-gradient(ellipse at 50% 100%, #3b82f622 0%, transparent 60%) 
            ` 
          }} 
        /> 
        {/* Grid pattern overlay */} 
        <div 
          className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: `linear-gradient(#ffffff11 1px, transparent 1px), 
                              linear-gradient(90deg, #ffffff11 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }} 
        /> 
      </div> 
    
      {/* Content */} 
      <div className="relative z-10 p-6 pt-8"> 
    
        {/* Avatar + Actions row */} 
        <div className="flex justify-between items-start mb-4"> 
          <AvatarWithFrame user={user} size="xl" equipped={user?.equipped} /> 
          {isOwnProfile ? ( 
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} 
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full px-6"> 
              Edit Profile 
            </Button> 
          ) : ( 
            <FollowButton 
              targetUserId={user?._id} 
              username={user?.username}
              initialIsFollowing={false} 
              initialFollowersCount={user?.followers?.length || 0} 
            /> 
          )} 
        </div> 
    
        {/* Name + badges */} 
        <div className="space-y-1"> 
          <div className="flex items-center gap-2 flex-wrap"> 
            <h1 className="text-2xl font-bold">{user?.name}</h1> 
            {/* Verified badge */} 
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"> 
              <circle cx="12" cy="12" r="12" fill="#3b82f6" /> 
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" 
                strokeLinecap="round" strokeLinejoin="round" fill="none" /> 
            </svg> 
          </div> 
    
          {/* Username */} 
          <p className="text-muted-foreground">@{user?.username}</p> 
    
          {/* Founder badge row */} 
          <div className="pt-1"> 
            <FounderBadges size="md" /> 
          </div> 
        </div> 
    
        {/* Creator tagline */} 
        <div className="mt-4 flex items-center gap-2"> 
          <span 
            className="text-xs px-3 py-1.5 rounded-full font-mono font-bold tracking-widest uppercase" 
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b22, #8b5cf622)', 
              border: '1px solid #f59e0b40', 
              color: '#f59e0b' 
            }} 
          > 
            Platform Founder 
          </span> 
          <span className="text-xs text-muted-foreground font-medium"> 
            Launched {getDaysSinceLaunch()} days ago 
          </span> 
        </div> 
    
        {/* Bio */} 
        {user?.bio && ( 
          <div className="mt-4 text-sm text-foreground/90 leading-relaxed max-w-xl"> 
            {renderContentWithMentions(user.bio).map((segment, i) => {
              if (segment.type === 'hashtag') {
                return (
                  <Link 
                    key={i} 
                    href={`/hashtag/${segment.value}`}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    #{segment.value}
                  </Link>
                )
              } else if (segment.type === 'mention') {
                return <UserMention key={i} username={segment.value} />
              } else if (segment.type === 'url') {
                return (
                  <a 
                    key={i} 
                    href={segment.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {segment.value}
                  </a>
                )
              }
              return <span key={i}>{segment.value}</span>
            })}
          </div> 
        )} 
    
        {/* Stats row */} 
        <div className="mt-6 flex items-center gap-6"> 
          <div className="flex flex-col"> 
            <span className="text-lg font-bold">{formatCount(stats?.followers || 0)}</span> 
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Followers</span> 
          </div> 
          <div className="flex flex-col"> 
            <span className="text-lg font-bold">{formatCount(stats?.posts || 0)}</span> 
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Posts</span> 
          </div> 
          <div className="flex flex-col"> 
            <span className="text-lg font-bold">{formatCount(stats?.views || 0)}</span> 
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Views</span> 
          </div> 
        </div> 
 
        {/* Admin Broadcast Manager (Only for founder) */} 
        {isOwnProfile && ( 
          <div className="mt-8 border-t border-border/50 pt-6"> 
            <BroadcastManager /> 
          </div> 
        )} 
 
        {/* Roadmap Widget (Always visible on founder profile) */} 
        <div className="mt-8"> 
          <RoadmapWidget isAdmin={isOwnProfile} /> 
        </div> 
    
      </div> 
    </div> 
  ) 
} 
