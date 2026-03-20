"use client"

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import { getDaysSinceLaunch, LAUNCH_DATE } from '@/lib/founder' 
import { formatCount } from '@/utils/formatters'
import FounderAvatar from './FounderAvatar'
import FounderBadges from './FounderBadges'
import RoadmapWidget from './RoadmapWidget'
import FollowButton from '@/components/user/FollowButton'
import BroadcastManager from './BroadcastManager'

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
          <FounderAvatar user={user} size="xl" /> 
          {isOwnProfile ? ( 
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} 
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full px-6"> 
              Edit Profile 
            </Button> 
          ) : ( 
            <FollowButton 
              targetUserId={user._id} 
              username={user.username}
              initialIsFollowing={false} 
              initialFollowersCount={user.followers?.length || 0} 
            /> 
          )} 
        </div> 
    
        {/* Name + badges */} 
        <div className="space-y-1"> 
          <div className="flex items-center gap-2 flex-wrap"> 
            <h1 className="text-2xl font-bold">{user.name}</h1> 
            {/* Verified badge */} 
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0"> 
              <circle cx="12" cy="12" r="12" fill="#3b82f6" /> 
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" 
                strokeLinecap="round" strokeLinejoin="round" fill="none" /> 
            </svg> 
          </div> 
    
          {/* Username */} 
          <p className="text-muted-foreground">@{user.username}</p> 
    
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
            ⚡ Creator of CampusX 
          </span> 
        </div> 
    
        {/* Bio */} 
        {user.bio && <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>} 
    
        {/* Meta row */} 
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground"> 
          {user.college && <span>🎓 {user.college}</span>} 
          <span>📅 Day {getDaysSinceLaunch()} of CampusX</span> 
          <span>🗓️ Since {LAUNCH_DATE.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span> 
        </div> 
    
        {/* Stats row — special styling */} 
        <div className="grid grid-cols-3 gap-3 mt-5"> 
          {[ 
            { label: 'Posts', value: stats.postCount, clickable: false }, 
            { label: 'Followers', value: formatCount(user.followers?.length || 0), clickable: true, tab: 'followers' }, 
            { label: 'Following', value: formatCount(user.following?.length || 0), clickable: true, tab: 'following' } 
          ].map(stat => ( 
            <div 
              key={stat.label} 
              onClick={() => stat.clickable && onFollowClick?.(stat.tab)}
              className={cn(
                "text-center py-2 rounded-lg transition-colors",
                stat.clickable && "cursor-pointer hover:bg-[#252525] hover:border-amber-500/30 group"
              )} 
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            > 
              <p className={cn("text-lg font-bold transition-colors", stat.clickable && "group-hover:text-amber-400")}>{stat.value}</p> 
              <p className="text-xs text-muted-foreground">{stat.label}</p> 
            </div> 
          ))} 
        </div> 
    
        {/* Profile views — only visible to founder themselves */} 
        {isOwnProfile && ( 
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"> 
            <Eye className="w-3 h-3" /> 
            {user.founderData?.profileViews || 0} total profile views 
            · {user.founderData?.profileViewsToday || 0} today 
          </p> 
        )} 

        {/* Roadmap widget */}
        <RoadmapWidget isOwnProfile={isOwnProfile} />

        {/* Broadcast Manager — only for founder's own profile */}
        {isOwnProfile && (
          <BroadcastManager 
            currentBroadcast={{
              message: user.founderData?.broadcastMessage,
              active: user.founderData?.broadcastActive
            }} 
          />
        )}
    
      </div> 
    </div> 
  )
}
