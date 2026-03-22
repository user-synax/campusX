"use client" 
 
import { useState } from 'react' 
import { useRouter } from 'next/navigation' 
import {  
  UserMinus,  
  Trash2,  
  LogOut,  
  Check,  
  X,  
  Loader2,  
  Edit,  
  Save, 
  Plus, 
  ShieldCheck 
} from 'lucide-react' 
import {  
  Sheet,  
  SheetContent,  
  SheetHeader,  
  SheetTitle,  
  SheetDescription 
} from "@/components/ui/sheet" 
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input" 
import { Textarea } from "@/components/ui/textarea" 
import { Badge } from "@/components/ui/badge" 
import UserAvatar from "@/components/user/UserAvatar" 
import { toast } from "sonner" 

export default function GroupInfoSheet({ group, currentUserId, isAdmin, onUpdate, open, onOpenChange }) { 
  const [editing, setEditing] = useState(false) 
  const [name, setName] = useState(group?.name || '') 
  const [description, setDescription] = useState(group?.description || '') 
  const [saving, setSaving] = useState(false) 
  const [leaving, setLeaving] = useState(false) 
  const [deleting, setDeleting] = useState(false) 
  const [removingId, setRemovingId] = useState(null)
  const router = useRouter() 
 
  const handleUpdate = async () => { 
    if (!name.trim()) return
    setSaving(true) 
    try {
      const res = await fetch(`/api/groups/${group._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Group updated!")
        setEditing(false)
        onUpdate(data)
      } else {
        toast.error(data.message || "Failed to update group")
      }
    } catch (error) {
      toast.error("Error updating group")
    } finally {
      setSaving(false)
    }
  } 
 
  const handleLeave = async () => { 
    if (!window.confirm("Are you sure you want to leave this group?")) return
    setLeaving(true) 
    try {
      const res = await fetch(`/api/groups/${group._id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      })
      if (res.ok) {
        toast.success("You left the group")
        onOpenChange(false)
        router.push('/chats')
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to leave group")
      }
    } catch (error) {
      toast.error("Error leaving group")
    } finally {
      setLeaving(false)
    }
  } 
 
  const handleDelete = async () => { 
    if (!window.confirm("Are you sure you want to delete this group? This action is irreversible.")) return
    setDeleting(true) 
    try {
      const res = await fetch(`/api/groups/${group._id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Group deleted")
        onOpenChange(false)
        router.push('/chats')
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to delete group")
      }
    } catch (error) {
      toast.error("Error deleting group")
    } finally {
      setDeleting(false)
    }
  } 
 
  const handleRemoveMember = async (userId) => { 
    if (!window.confirm("Remove this member?")) return
    setRemovingId(userId)
    try {
      const res = await fetch(`/api/groups/${group._id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        toast.success("Member removed")
        // Refetch or update local state via parent
        const updatedMembers = group.members.filter(m => m.userId._id !== userId)
        onUpdate({ ...group, members: updatedMembers })
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to remove member")
      }
    } catch (error) {
      toast.error("Error removing member")
    } finally {
      setRemovingId(null)
    }
  } 
 
  return ( 
    <Sheet open={open} onOpenChange={onOpenChange}> 
      <SheetContent className="bg-card border-border overflow-y-auto custom-scrollbar sm:max-w-md"> 
        <SheetHeader className="mb-6"> 
          <SheetTitle className="text-xl font-bold">Group Info</SheetTitle> 
          <SheetDescription>View and manage group details</SheetDescription> 
        </SheetHeader> 
 
        <div className="space-y-8"> 
          {/* Group Profile */} 
          <div className="flex flex-col items-center text-center space-y-4"> 
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30  
                            border-2 border-border flex items-center justify-center font-bold text-3xl overflow-hidden shadow-xl"> 
              {group?.avatar  
                ? <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />  
                : group?.name?.charAt(0)?.toUpperCase()  
              } 
            </div> 
 
            <div className="w-full space-y-1"> 
              {editing ? ( 
                <div className="space-y-3"> 
                  <Input  
                    value={name}  
                    onChange={(e) => setName(e.target.value)}  
                    className="text-center font-bold bg-accent/50 h-10" 
                    placeholder="Group name"
                  /> 
                  <Textarea  
                    value={description}  
                    onChange={(e) => setDescription(e.target.value)}  
                    className="text-center text-xs bg-accent/50 resize-none min-h-[80px]" 
                    placeholder="Add description..."
                  /> 
                  <div className="flex gap-2 justify-center"> 
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}> 
                      <X className="w-4 h-4 mr-1" /> Cancel 
                    </Button> 
                    <Button size="sm" onClick={handleUpdate} disabled={saving || !name.trim()}> 
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save 
                    </Button> 
                  </div> 
                </div> 
              ) : ( 
                <> 
                  <h2 className="text-xl font-bold flex items-center justify-center gap-2 px-4"> 
                    {group?.name} 
                    {isAdmin && ( 
                      <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground"> 
                        <Edit className="w-3.5 h-3.5" /> 
                      </button> 
                    )} 
                  </h2> 
                  <p className="text-sm text-muted-foreground px-4 line-clamp-3"> 
                    {group?.description || 'No description provided'} 
                  </p> 
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                      🎓 {group?.college || 'Public'}
                    </Badge>
                  </div>
                </> 
              )} 
            </div> 
          </div> 
 
          {/* Members List */} 
          <div className="space-y-4"> 
            <div className="flex items-center justify-between border-b border-border/50 pb-2"> 
              <h3 className="font-bold text-sm">Members ({group?.members?.length})</h3> 
              {isAdmin && ( 
                <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold text-primary hover:text-primary hover:bg-primary/10"> 
                  <Plus className="w-3 h-3 mr-1" /> Add 
                </Button> 
              )} 
            </div> 
 
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"> 
              {group?.members?.map(member => ( 
                <div key={member.userId._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/30 transition-colors"> 
                  <UserAvatar user={member.userId} size="sm" /> 
                  <div className="flex-1 min-w-0"> 
                    <p className="text-sm font-semibold truncate flex items-center gap-1.5"> 
                      {member.userId.name} 
                      {member.userId._id === currentUserId && (
                        <span className="text-[10px] text-muted-foreground">(You)</span>
                      )}
                    </p> 
                    <p className="text-xs text-muted-foreground truncate">@{member.userId.username}</p> 
                  </div> 
                  
                  {member.role === 'admin' && ( 
                    <Badge className="text-[9px] bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-1.5 h-4 font-bold"> 
                      <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> ADMIN 
                    </Badge> 
                  )} 
 
                  {/* Remove button — admin only, can't remove self */} 
                  {isAdmin && member.userId._id !== currentUserId && ( 
                    <button  
                      onClick={() => handleRemoveMember(member.userId._id)}  
                      disabled={removingId === member.userId._id}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors" 
                    > 
                      {removingId === member.userId._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />} 
                    </button> 
                  )} 
                </div> 
              ))} 
            </div> 
          </div> 
 
          {/* Danger Zone */} 
          <div className="pt-6 border-t border-border/50 space-y-3"> 
            {group?.createdBy !== currentUserId && ( 
              <Button  
                variant="destructive"  
                className="w-full bg-destructive/5 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"  
                onClick={handleLeave} 
                disabled={leaving} 
              > 
                {leaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />} 
                Leave Group 
              </Button> 
            )} 
            {isAdmin && ( 
              <Button  
                variant="destructive"  
                className="w-full"  
                onClick={handleDelete} 
                disabled={deleting} 
              > 
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} 
                Delete Group 
              </Button> 
            )} 
          </div> 
        </div> 
      </SheetContent> 
    </Sheet> 
  ) 
} 
