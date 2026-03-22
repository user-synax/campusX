"use client" 
 
import { useState, useEffect } from 'react' 
import { useRouter } from 'next/navigation' 
import {  
  Search,  
  MessageSquare,  
  Plus,  
  ArrowLeft,  
  Users,  
  GraduationCap, 
  Loader2 
} from 'lucide-react' 
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge" 
import EmptyState from "@/components/shared/EmptyState" 
import { toast } from "sonner" 
import useUser from "@/hooks/useUser"

export default function DiscoverGroupsPage() { 
  const [groups, setGroups] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [searchQuery, setSearchQuery] = useState('') 
  const [joiningId, setJoiningId] = useState(null)
  const { user: currentUser } = useUser()
  const router = useRouter() 
 
  useEffect(() => { 
    if (currentUser) fetchDiscoverGroups() 
  }, [currentUser]) 
 
  const fetchDiscoverGroups = async (q = '') => { 
    try { 
      setLoading(true) 
      const res = await fetch(`/api/groups/discover?q=${encodeURIComponent(q)}`) 
      const data = await res.json() 
      if (res.ok) { 
        setGroups(data.groups || []) 
      } 
    } catch (error) { 
      console.error('Discover groups error:', error) 
    } finally { 
      setLoading(false) 
    } 
  } 
 
  const handleSearch = (e) => { 
    e.preventDefault() 
    fetchDiscoverGroups(searchQuery) 
  } 
 
  const handleJoin = async (groupId) => { 
    setJoiningId(groupId)
    try { 
      const res = await fetch(`/api/groups/${groupId}/members`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userId: currentUser._id }) 
      }) 
      if (res.ok) { 
        toast.success("Joined group!") 
        router.push(`/chats/${groupId}`) 
      } else { 
        const data = await res.json() 
        toast.error(data.message || "Failed to join group") 
      } 
    } catch (error) { 
      toast.error("An error occurred") 
    } finally { 
      setJoiningId(null)
    } 
  } 
 
  return ( 
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background"> 
      {/* Header */} 
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b z-10 px-4 py-3"> 
        <div className="flex items-center gap-3 mb-4"> 
          <Button variant="ghost" size="icon" onClick={() => router.push('/chats')} className="rounded-full"> 
            <ArrowLeft className="w-5 h-5" /> 
          </Button> 
          <h1 className="text-xl font-bold">Discover Groups</h1> 
        </div> 
 
        <form onSubmit={handleSearch} className="relative"> 
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> 
          <Input 
            placeholder="Search by group name or description..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-9 h-10 bg-accent/50 border-border/50 focus-visible:ring-primary/50" 
          /> 
        </form> 
        <p className="text-[10px] text-muted-foreground mt-2 px-1"> 
          Showing groups from <span className="text-primary font-bold">{currentUser?.college || 'your college'}</span> 
        </p> 
      </div> 
 
      {/* List */} 
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar"> 
        {loading ? ( 
          <div className="flex flex-col items-center justify-center py-20 gap-4"> 
            <Loader2 className="w-8 h-8 animate-spin text-primary" /> 
            <p className="text-sm text-muted-foreground">Searching for groups...</p> 
          </div> 
        ) : groups.length === 0 ? ( 
          <EmptyState 
            icon={Users} 
            title="No groups found" 
            description="Be the first to create a group for your college!" 
            actionLabel="Create Group" 
            onAction={() => router.push('/chats')} 
          /> 
        ) : ( 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
            {groups.map(group => ( 
              <div key={group._id} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-4 hover:border-primary/30 transition-all group"> 
                <div className="flex items-start gap-3"> 
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20  
                                  border border-border flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm"> 
                    {group.avatar  
                      ? <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />  
                      : group.name.charAt(0).toUpperCase()  
                    } 
                  </div> 
                  <div className="flex-1 min-w-0"> 
                    <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{group.name}</h3> 
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{group.description || 'No description'}</p> 
                  </div> 
                </div> 
 
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30"> 
                  <div className="flex items-center gap-3"> 
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full"> 
                      <Users className="w-3 h-3" /> 
                      {group.members?.length || 0} 
                    </div> 
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full"> 
                      <MessageSquare className="w-3 h-3" /> 
                      {group.messageCount || 0} 
                    </div> 
                  </div> 
 
                  <Button  
                    size="sm"  
                    onClick={() => handleJoin(group._id)} 
                    disabled={joiningId === group._id}
                    className="h-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all text-xs px-4" 
                  > 
                    {joiningId === group._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Join 
                  </Button> 
                </div> 
              </div> 
            ))} 
          </div> 
        )} 
      </div> 
    </div> 
  ) 
} 
