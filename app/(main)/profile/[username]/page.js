"use client"

import { useState, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { FileText } from "lucide-react"
import useUser from "@/hooks/useUser"
import { usePosts } from "@/hooks/usePosts"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username
  const { user: currentUser, refetch: refetchCurrentUser } = useUser()
  const { posts, loading: postsLoading, removePost, updatePostLike } = usePosts({ username })
  
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    college: '',
    course: '',
    year: ''
  })

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
          setEditData({
            name: userData.name || '',
            bio: userData.bio || '',
            college: userData.college || '',
            course: userData.course || '',
            year: userData.year?.toString() || '1'
          })
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

  const handleEditSave = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      const data = await res.json()
      if (res.ok) {
        setProfileUser(prev => ({ ...prev, ...data }))
        setEditOpen(false)
        toast.success("Profile updated!")
        refetchCurrentUser()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error("Update failed", {
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
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

  const isOwnProfile = currentUser?.username?.toLowerCase() === profileUser.username?.toLowerCase()
  const isFollowing = currentUser?.following?.includes(profileUser._id)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
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
          
          <h1 className="text-xl font-bold">{profileUser.name}</h1>
          <p className="text-muted-foreground text-sm">@{profileUser.username}</p>
          
          {profileUser.bio && <p className="mt-3 text-[15px]">{profileUser.bio}</p>}
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
            {profileUser.college && <span className="flex items-center gap-1">🎓 {profileUser.college}</span>}
            {profileUser.course && <span className="flex items-center gap-1">📚 {profileUser.course}</span>}
            {profileUser.year && <span className="flex items-center gap-1">📅 Year {profileUser.year}</span>}
          </div>
          
          <div className="flex gap-5 mt-4 text-sm">
            <span className="flex gap-1"><strong>{profileUser.followingCount}</strong> <span className="text-muted-foreground">Following</span></span>
            <span className="flex gap-1"><strong>{profileUser.followersCount}</strong> <span className="text-muted-foreground">Followers</span></span>
            <span className="flex gap-1"><strong>{profileUser.postCount}</strong> <span className="text-muted-foreground">Posts</span></span>
          </div>
        </div>
      </div>

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
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              currentUserId={currentUser?._id} 
              onDelete={removePost} 
              onLike={updatePostLike} 
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-160.25 bg-background">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name" 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea 
                id="edit-bio" 
                value={editData.bio} 
                onChange={e => setEditData({...editData, bio: e.target.value})} 
                placeholder="Tell us about yourself"
                className="resize-none"
                maxLength={160}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-college">College</Label>
                <Input 
                  id="edit-college" 
                  value={editData.college} 
                  onChange={e => setEditData({...editData, college: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course">Course</Label>
                <Input 
                  id="edit-course" 
                  value={editData.course} 
                  onChange={e => setEditData({...editData, course: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-year">Year</Label>
              <Select 
                value={editData.year} 
                onValueChange={v => setEditData({...editData, year: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}st Year</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
