"use client" 
 
import { useState, useCallback } from 'react' 
import { useRouter } from 'next/navigation' 
import { Check, X, Loader2, Search } from 'lucide-react' 
import {  
  Dialog,  
  DialogContent,  
  DialogHeader,  
  DialogTitle,  
  DialogDescription 
} from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input" 
import { Textarea } from "@/components/ui/textarea" 
import UserAvatar from "@/components/user/UserAvatar" 
import { toast } from "sonner" 

export default function CreateGroupModal({ open, onOpenChange }) { 
  const [step, setStep] = useState(1) 
  const [name, setName] = useState('') 
  const [description, setDescription] = useState('') 
  const [memberSearch, setMemberSearch] = useState('') 
  const [searchResults, setSearchResults] = useState([]) 
  const [selectedMembers, setSelectedMembers] = useState([]) 
  const [creating, setCreating] = useState(false) 
  const [searching, setSearching] = useState(false)
  const router = useRouter() 
 
  // Custom debounce function
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedSearchUsers = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (res.ok) {
          setSearchResults(data.users || [])
        }
      } catch (error) {
        console.error('User search failed:', error)
      } finally {
        setSearching(false)
      }
    }, 500),
    []
  )

  const toggleMember = (user) => { 
    setSelectedMembers(prev => { 
      const isSelected = prev.find(m => m._id === user._id) 
      if (isSelected) { 
        return prev.filter(m => m._id !== user._id) 
      } else { 
        return [...prev, { _id: user._id, name: user.name, username: user.username, avatar: user.avatar }] 
      } 
    }) 
  } 
 
  const handleCreate = async () => { 
    if (!name.trim()) return
    
    setCreating(true) 
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          memberIds: selectedMembers.map(m => m._id)
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Group created successfully!")
        onOpenChange(false)
        router.push(`/chats/${data._id}`)
      } else {
        toast.error(data.message || "Failed to create group")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setCreating(false)
    }
  } 
 
  return ( 
    <Dialog open={open} onOpenChange={onOpenChange}> 
      <DialogContent className="sm:max-w-[425px] bg-card border-border"> 
        <DialogHeader> 
          <DialogTitle className="text-xl font-bold"> 
            {step === 1 ? 'Create New Group' : 'Add Members'} 
          </DialogTitle> 
          <DialogDescription> 
            {step === 1 ? 'Give your group a name and description.' : 'Search and select members for your group.'} 
          </DialogDescription> 
        </DialogHeader> 
 
        {step === 1 ? ( 
          <div className="space-y-4 py-4"> 
            <div className="space-y-2"> 
              <label className="text-sm font-medium">Group Name *</label> 
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. DSA Study Group, Placement Prep" 
                maxLength={60} 
                className="bg-accent/50"
              /> 
            </div> 
            <div className="space-y-2"> 
              <label className="text-sm font-medium">Description</label> 
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What's this group about?" 
                rows={3} 
                maxLength={200} 
                className="resize-none bg-accent/50" 
              /> 
            </div> 
            <Button 
              className="w-full bg-primary text-primary-foreground hover:opacity-90" 
              onClick={() => setStep(2)} 
              disabled={!name.trim() || name.trim().length < 2} 
            > 
              Next: Add Members → 
            </Button> 
          </div> 
        ) : ( 
          <div className="space-y-4 py-4"> 
            <button  
              onClick={() => setStep(1)}  
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
            > 
              ← Back to details 
            </button> 
 
            {/* Search users */} 
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or @username..." 
                value={memberSearch} 
                onChange={(e) => { 
                  setMemberSearch(e.target.value) 
                  debouncedSearchUsers(e.target.value) 
                }} 
                className="pl-9 bg-accent/50"
              /> 
            </div>
 
            {/* Search results */} 
            <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {searching ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => ( 
                  <div 
                    key={user._id} 
                    onClick={() => toggleMember(user)} 
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${ 
                      selectedMembers.find(m => m._id === user._id) 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-accent/50 border border-transparent' 
                    }`} 
                  > 
                    <UserAvatar user={user} size="sm" /> 
                    <div className="flex-1 min-w-0"> 
                      <p className="text-sm font-semibold truncate">{user.name}</p> 
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p> 
                    </div> 
                    {selectedMembers.find(m => m._id === user._id) && ( 
                      <Check className="w-4 h-4 text-primary" /> 
                    )} 
                  </div> 
                ))
              ) : memberSearch.length >= 2 ? (
                <p className="text-center py-4 text-sm text-muted-foreground">No users found</p>
              ) : (
                <p className="text-center py-4 text-sm text-muted-foreground">Type to search users...</p>
              )}
            </div> 
 
            {/* Selected members chips */} 
            {selectedMembers.length > 0 && ( 
              <div className="flex flex-wrap gap-2 p-3 bg-accent/30 rounded-xl border border-border/50"> 
                {selectedMembers.map(m => ( 
                  <div key={m._id} className="flex items-center gap-1.5 bg-primary/10  
                                              border border-primary/20 rounded-full pl-1.5 pr-2 py-1"> 
                    <UserAvatar user={m} size="xs" />
                    <span className="text-[10px] font-medium">{m.name.split(' ')[0]}</span> 
                    <button onClick={() => toggleMember(m)} className="hover:text-destructive"> 
                      <X className="w-3 h-3" /> 
                    </button> 
                  </div> 
                ))} 
              </div> 
            )} 
 
            <Button 
              className="w-full bg-primary text-primary-foreground hover:opacity-90" 
              onClick={handleCreate} 
              disabled={creating || selectedMembers.length === 0} 
            > 
              {creating 
                ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> 
                : `Create Group (${selectedMembers.length + 1} members)` 
              } 
            </Button> 
          </div> 
        )} 
      </DialogContent> 
    </Dialog> 
  ) 
} 
