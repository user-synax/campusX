"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Camera, AlertCircle } from "lucide-react"
import { toast } from "sonner"

/**
 * EditProfileDrawer component for editing user profile.
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onOpenChange - Callback to change open state
 * @param {Function} props.onSave - Callback when profile is successfully updated
 */
export default function EditProfileDrawer({ user, open, onOpenChange, onSave }) {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState(1)
  
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  // Reset state when drawer opens with current user values
  useEffect(() => {
    if (open && user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setCollege(user.college || '')
      setCourse(user.course || '')
      setYear(user.year || 1)
      setAvatarPreview(null)
      setError(null)
    }
  }, [open, user])

  const triggerFileInput = () => {
    if (!uploadingAvatar && !saving) {
      fileInputRef.current?.click()
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images allowed")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    // Immediately upload
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success("Photo updated! ✨")
        // If the user saves later, the avatar is already updated in the DB
        // But we want to reflect it in the preview correctly
        setAvatarPreview(data.avatarUrl)
      } else {
        throw new Error(data.message || "Upload failed")
      }
    } catch (err) {
      setAvatarPreview(null)
      toast.error(err.message || "Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long")
      return
    }

    setError(null)
    setSaving(true)

    try {
      const res = await fetch(`/api/users/${user.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          bio: bio.trim(),
          college: college.trim(),
          course: course.trim(),
          year: Number(year)
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Profile updated! ✅")
        onSave(data)
        onOpenChange(false)
      } else {
        throw new Error(data.message || "Update failed")
      }
    } catch (err) {
      setError(err.message || "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>

        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="relative group cursor-pointer" 
            onClick={triggerFileInput}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-accent border-2 border-border flex items-center justify-center">
              {avatarPreview || user.avatar ? (
                <img 
                  src={avatarPreview || user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl font-bold text-muted-foreground">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">Click to change photo</p>
          <p className="text-[10px] text-muted-foreground/60">JPG, PNG or WebP · Max 5MB</p>

          <input 
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar || saving}
          />
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={saving}
            />
            <p className="text-[10px] text-muted-foreground text-right">{name.length}/50</p>
          </div>

          {/* Username — disabled */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Username
              <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground font-normal">
                Cannot be changed
              </span>
            </label>
            <Input 
              value={`@${user.username}`}
              disabled
              className="opacity-50 cursor-not-allowed bg-accent/30"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              maxLength={160}
              rows={3}
              className="resize-none"
              disabled={saving}
            />
            <p className={`text-[10px] text-right ${bio.length > 140 ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {bio.length}/160
            </p>
          </div>

          {/* College */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">College</label>
            <Input 
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Delhi"
              maxLength={100}
              disabled={saving}
            />
          </div>

          {/* Course + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Course</label>
              <Input 
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech CSE"
                maxLength={50}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Year</label>
              <select 
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                disabled={saving}
              >
                {[1, 2, 3, 4, 5, 6].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border sticky bottom-0 bg-background">
          <Button 
            variant="outline" 
            className="flex-1 rounded-full" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-full" 
            onClick={handleSave}
            disabled={saving || uploadingAvatar}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
