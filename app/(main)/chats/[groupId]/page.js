"use client" 
 
import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, Loader2, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useUser from "@/hooks/useUser"
import { useGroupChat } from "@/hooks/useGroupChat"
import MessageBubble from "@/components/chat/MessageBubble"
import MessageInput from "@/components/chat/MessageInput"
import TypingIndicator from "@/components/chat/TypingIndicator"
import GroupInfoSheet from "@/components/chat/GroupInfoSheet"

export default function ChatRoomPage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const groupId = params.groupId
  const router = useRouter()
  const { user: currentUser } = useUser()
  
  const [messages, setMessages] = useState([])
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const [infoOpen, setInfoOpen] = useState(false)
  
  const messagesContainerRef = useRef(null)
  const bottomRef = useRef(null)

  // ━━━ Fetching ━━━
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const [groupRes, messagesRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/messages?limit=30`)
      ])

      const groupData = await groupRes.json()
      const messagesData = await messagesRes.json()

      if (groupRes.ok) setGroup(groupData)
      if (messagesRes.ok) {
        setMessages(messagesData.messages)
        setHasMore(messagesData.hasMore)
        setCursor(messagesData.nextCursor)
      }

      // Mark as read
      fetch(`/api/groups/${groupId}/read`, { method: 'POST' }).catch(() => {})
      
      // Initial scroll
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Chat data fetch error:', error)
      toast.error("Failed to load chat")
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    if (groupId) fetchInitialData()
  }, [groupId, fetchInitialData])

  const loadOlderMessages = async () => {
    if (!cursor || loadingOlder) return
    
    const savedScrollHeight = messagesContainerRef.current.scrollHeight 
    setLoadingOlder(true)
    
    try {
      const res = await fetch(`/api/groups/${groupId}/messages?cursor=${cursor}&limit=30`) 
      const data = await res.json()
      
      if (res.ok) {
        setMessages(prev => [...data.messages, ...prev]) 
        setCursor(data.nextCursor) 
        setHasMore(data.hasMore) 
        
        // Maintain scroll position
        requestAnimationFrame(() => { 
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight 
            messagesContainerRef.current.scrollTop = newScrollHeight - savedScrollHeight 
          }
        })
      }
    } catch (error) {
      console.error('Load older error:', error)
    } finally {
      setLoadingOlder(false)
    }
  }

  // ━━━ Real-time Handlers ━━━
  const onNewMessage = useCallback((message) => {
    setMessages(prev => {
      // Avoid duplicates if sender already added it locally (though here we rely on Pusher)
      if (prev.some(m => m._id === message._id)) return prev
      return [...prev, message]
    })
    
    // Auto-scroll if near bottom
    if (isNearBottom()) {
      setTimeout(scrollToBottom, 50)
    }
    
    // Mark as read
    fetch(`/api/groups/${groupId}/read`, { method: 'POST' }).catch(() => {})
  }, [groupId])

  const onMessageDeleted = useCallback(({ messageId }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId 
        ? { ...m, isDeleted: true, content: '', imageUrl: '' } 
        : m 
    ))
  }, [])

  const onTypingStart = useCallback(({ userId, userName, userAvatar }) => {
    if (userId === currentUser?._id) return
    setTypingUsers(prev => ({ 
      ...prev, 
      [userId]: { name: userName, avatar: userAvatar } 
    }))
  }, [currentUser])

  const onTypingStop = useCallback(({ userId }) => {
    setTypingUsers(prev => { 
      const next = { ...prev } 
      delete next[userId] 
      return next 
    })
  }, [])

  const onReaction = useCallback(({ messageId, reactions }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, reactions } : m 
    ))
  }, [])

  const onGroupDeleted = useCallback(() => {
    toast.error("This group was deleted")
    router.push('/chats')
  }, [router])

  const onMemberRemoved = useCallback(({ userId }) => {
    if (userId === currentUser?._id) {
      toast.error("You were removed from this group")
      router.push('/chats')
    } else {
      // Refetch members
      fetch(`/api/groups/${groupId}`).then(res => res.json()).then(setGroup).catch(() => {})
    }
  }, [currentUser, groupId, router])

  const onMemberAdded = useCallback(() => {
    fetch(`/api/groups/${groupId}`).then(res => res.json()).then(setGroup).catch(() => {})
  }, [groupId])

  useGroupChat(groupId, {
    onNewMessage,
    onMessageDeleted,
    onTypingStart,
    onTypingStop,
    onReaction,
    onGroupDeleted,
    onMemberRemoved,
    onMemberAdded
  })

  // ━━━ Actions ━━━
  const handleSend = async (content) => {
    try {
      setSending(true)
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'text' })
      })
      
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.message || "Failed to send message")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (isTyping) => {
    fetch(`/api/groups/${groupId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTyping })
    }).catch(() => {})
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: 'DELETE'
      })
      if (!res.ok) toast.error("Failed to delete message")
    } catch (error) {
      toast.error("Error deleting message")
    }
  }

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      if (!res.ok) toast.error("Failed to react")
    } catch (error) {
      toast.error("Error reacting")
    }
  }

  // ━━━ Helpers ━━━
  const scrollToBottom = () => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }

  const isNearBottom = () => { 
    const container = messagesContainerRef.current 
    if (!container) return true 
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150 
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background"> 
 
      {/* ━━━ Chat Header ━━━ */} 
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border z-10"> 
        <div className="flex items-center gap-3 px-4 py-3"> 
          <Button variant="ghost" size="icon" onClick={() => router.push('/chats')} className="rounded-full"> 
            <ArrowLeft className="w-5 h-5" /> 
          </Button> 
 
          {/* Group avatar */} 
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 
                          border border-border flex items-center justify-center font-bold flex-shrink-0 overflow-hidden"> 
            {group?.avatar 
              ? <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" /> 
              : group?.name?.charAt(0)?.toUpperCase() 
            } 
          </div> 
 
          <div className="flex-1 min-w-0"> 
            <p className="font-semibold text-sm truncate">{group?.name}</p> 
            <p className="text-[11px] text-muted-foreground"> 
              {group?.members?.length} members 
            </p> 
          </div> 
 
          <Button variant="ghost" size="icon" onClick={() => setInfoOpen(true)} className="rounded-full"> 
            <Info className="w-4 h-4" /> 
          </Button> 
        </div> 
      </div> 
 
      {/* ━━━ Messages Area ━━━ */} 
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar" 
      > 
        {hasMore && ( 
          <div className="text-center py-4"> 
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadOlderMessages} 
              disabled={loadingOlder} 
              className="text-xs text-muted-foreground hover:bg-accent/50" 
            > 
              {loadingOlder 
                ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> 
                : <ChevronUp className="w-3 h-3 mr-1" /> 
              } 
              Load older messages 
            </Button> 
          </div> 
        )} 
 
        {messages.map((message, i) => ( 
          <MessageBubble 
            key={message._id} 
            message={message} 
            isOwn={message.sender?._id === currentUser?._id} 
            showAvatar={ 
              i === 0 || messages[i-1]?.sender?._id !== message.sender?._id 
            } 
            currentUserId={currentUser?._id} 
            onDelete={handleDeleteMessage} 
            onReact={handleReact} 
          /> 
        ))} 
 
        {Object.keys(typingUsers).length > 0 && ( 
          <TypingIndicator users={Object.values(typingUsers)} /> 
        )} 
 
        <div ref={bottomRef} className="h-4" /> 
      </div> 
 
      {/* ━━━ Message Input ━━━ */} 
      <MessageInput 
        onSend={handleSend} 
        onTyping={handleTyping} 
        sending={sending} 
        groupId={groupId} 
      /> 
 
      {/* Group Info Sheet */}
      <GroupInfoSheet 
        group={group} 
        currentUserId={currentUser?._id} 
        isAdmin={group?.members?.find(m => m.userId._id === currentUser?._id)?.role === 'admin'} 
        onUpdate={setGroup} 
        open={infoOpen} 
        onOpenChange={setInfoOpen} 
      />
    </div> 
  )
}
