"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { FileText, Pin } from "lucide-react"
import useUser from "@/hooks/useUser"
import { usePosts } from "@/hooks/usePosts"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel"
import { isFounder } from "@/lib/founder"
import { renderContentWithMentions } from "@/utils/hashtags"
import UserMention from "@/components/shared/UserMention"
import dynamic from 'next/dynamic'
import Link from 'next/link'

const FounderProfileHeader = dynamic(() => import('@/components/founder/FounderProfileHeader'), { ssr: false })
const RoadmapWidget = dynamic(() => import('@/components/founder/RoadmapWidget'), { ssr: false })
const BroadcastManager = dynamic(() => import('@/components/founder/BroadcastManager'), { ssr: false })
const FollowListModal = dynamic(() => import('@/components/user/FollowListModal'), { ssr: false })
const EditProfileDrawer = dynamic(() => import('@/components/user/EditProfileDrawer'), { ssr: false })

export default function ProfilePage() {
  const params = useParams()
  const username = params.username
  const { user: currentUser, refetch: refetchCurrentUser } = useUser()
  const { 
    posts, 
    loading: postsLoading, 
    error: postsError,
    hasMore, 
    loadMore, 
    addPost, 
    removePost, 
    updatePostLike 
  } = usePosts({ username })
  
  const { sentinelRef } = useInfiniteScroll({
    fetchMore: loadMore,
    hasMore,
    loading: postsLoading
  })

  const handleDeletePost = useCallback((postId) => {
    removePost(postId)
  }, [removePost])

  const handleLikePost = useCallback(async (postId) => {
    return await updatePostLike(postId)
  }, [updatePostLike])
  
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  
  // Follow modal state
  const [followModal, setFollowModal] = useState(false)
  const [followModalTab, setFollowModalTab] = useState('followers')
  
  // Derived state
  const isOwnProfile = profileUser?.isMe || currentUser?.username?.toLowerCase() === profileUser?.username?.toLowerCase()
  const isFollowing = profileUser?.isFollowing || currentUser?.following?.some(id => id.toString() === profileUser?._id?.toString())
  const isFounderProfile = profileUser?.isFounder || isFounder(username)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        // Fetch profile and posts in parallel
        const [userRes, postsRes] = await Promise.all([
          fetch(`/api/users/${username}`),
          fetch(`/api/posts/get?username=${username}`)
        ])
        
        const userData = await userRes.json()
        
        if (userRes.ok) {
          setProfileUser(userData)

          // Track profile view if it's the founder's profile and not their own visit
          if (isFounder(username) && currentUser?.username !== username) {
            fetch('/api/founder/profile-view', { method: 'POST' }).catch(() => {})
          }
        } else {
          toast.error("Failed to load profile", {
            description: userData.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchProfileData()
  }, [username])

  const handleEditSave = (updatedUser) => {
    setProfileUser(prev => ({ ...prev, ...updatedUser }))
    refetchCurrentUser()
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-32 bg-secondary animate-pulse" />
        <div className="px-4 pb-4 -mt-12 space-y-4">
          <div className="w-24 h-24 rounded-full bg-secondary animate-pulse border-4 border-background" />
          <div className="h-6 w-48 bg-secondary animate-pulse rounded" />
          <div className="h-4 w-32 bg-secondary animate-pulse rounded" />
        </div>
        <div className="mt-8">
          {[1, 2].map(i => <PostSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <EmptyState 
        icon={FileText} 
        title="User not found" 
        description="The profile you are looking for does not exist." 
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      {isFounderProfile ? (
        <FounderProfileHeader 
          user={profileUser} 
          isOwnProfile={isOwnProfile} 
          stats={{ postCount: profileUser.postCount }} 
          onFollowClick={(tab) => {
            setFollowModalTab(tab)
            setFollowModal(true)
          }}
        />
      ) : (
        <div>
          <div className="h-32 bg-linear-to-r from-[#1a1a1a] to-[#2a2a2a]" />
          
          <div className="px-4 pb-4">
            <div className="flex justify-between items-end -mt-12 mb-3">
              <UserAvatar user={profileUser} size="lg" className="w-24 h-24 border-4 border-background" />
              
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="rounded-full">
                  Edit profile
                </Button>
              ) : (
                <FollowButton 
                  targetUserId={profileUser._id} 
                  username={profileUser.username}
                  initialIsFollowing={isFollowing} 
                  initialFollowersCount={profileUser.followersCount}
                  onToggle={(following, count) => {
                    setProfileUser(prev => ({ ...prev, followersCount: count }))
                  }}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profileUser.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm">@{profileUser.username}</p>
            
            {profileUser.bio && (
              <div className="mt-3 text-[15px] whitespace-pre-wrap break-words">
                {renderContentWithMentions(profileUser.bio).map((segment, i) => {
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
                  } else {
                    return <span key={i}>{segment.value}</span>
                  }
                })}
              </div>
            )}
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              {profileUser.college && <span className="flex items-center gap-1">🎓 {profileUser.college}</span>}
              {profileUser.course && <span className="flex items-center gap-1">📚 {profileUser.course}</span>}
              {profileUser.year && <span className="flex items-center gap-1">📅 Year {profileUser.year}</span>}
            </div>
            
            <div className="flex gap-5 mt-4 text-sm">
              <button 
                onClick={() => { setFollowModal(true); setFollowModalTab('following') }} 
                className="flex gap-1 hover:underline"
              >
                <strong>{profileUser.followingCount}</strong> <span className="text-muted-foreground">Following</span>
              </button>
              <button 
                onClick={() => { setFollowModal(true); setFollowModalTab('followers') }} 
                className="flex gap-1 hover:underline"
              >
                <strong>{profileUser.followersCount}</strong> <span className="text-muted-foreground">Followers</span>
              </button>
              <span className="flex gap-1"><strong>{profileUser.postCount}</strong> <span className="text-muted-foreground">Posts</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Post if it exists */}
      {isFounderProfile && profileUser.pinnedPost && (
        <div className="border-b border-border bg-accent/5">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-amber-400/80">
            <Pin className="w-3 h-3" />
            <span>Pinned post</span>
          </div>
          <PostCard 
            post={profileUser.pinnedPost} 
            currentUserId={currentUser?._id} 
            isPinned={true} 
            onDelete={handleDeletePost}
            onLike={handleLikePost}
          />
        </div>
      )}

      {/* Tabs Placeholder */}
      <div className="flex border-b border-border mt-2">
        <div className="px-6 py-3 border-b-2 border-primary font-bold text-sm">Posts</div>
      </div>

      {/* Posts Section */}
      <div className="flex-1">
        {postsLoading && posts.length === 0 ? (
          [1, 2, 3].map(i => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No posts yet" 
            description={isOwnProfile ? "You haven't posted anything yet." : `@${profileUser.username} hasn't posted anything yet.`} 
          />
        ) : (
          <>
            <div className="divide-y divide-border">
              {posts.filter(post => post._id !== (profileUser?.pinnedPost?._id || profileUser?.pinnedPost)).map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUserId={currentUser?._id} 
                  onDelete={handleDeletePost} 
                  onLike={handleLikePost} 
                  isPinned={false}
                />
              ))}
            </div>
            
            <div ref={sentinelRef}>
              <InfiniteScrollSentinel 
                loading={postsLoading} 
                hasMore={hasMore} 
                error={postsError} 
                onRetry={loadMore} 
              />
            </div>
          </>
        )}
      </div>
      {/* Edit Profile Drawer */}
      {isOwnProfile && (
        <EditProfileDrawer 
          user={profileUser} 
          open={editOpen} 
          onOpenChange={setEditOpen} 
          onSave={handleEditSave}
        />
      )}

      {/* Follow list modal */}
      <FollowListModal 
        username={username} 
        initialTab={followModalTab} 
        followersCount={profileUser.followersCount} 
        followingCount={profileUser.followingCount} 
        open={followModal} 
        onOpenChange={setFollowModal} 
        currentUserId={currentUser?._id} 
      />
    </div>
  )
}
