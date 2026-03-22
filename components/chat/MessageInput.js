"use client" 
 
import { useState, useRef, useEffect } from 'react'
import { ImageIcon, Send, Loader2 } from 'lucide-react'

export default function MessageInput({ onSend, onTyping, sending, groupId }) {
  const [content, setContent] = useState('')
  const textareaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const handleChange = (e) => { 
    const val = e.target.value
    setContent(val) 
    
    // Auto-resize 
    e.target.style.height = 'auto' 
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' 

    // Typing indicator logic
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTyping(true)
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      onTyping(false)
    }, 2000)
  } 

  const handleSend = () => {
    if (content.trim() && !sending) {
      onSend(content.trim())
      setContent('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      // Stop typing immediately on send
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      isTypingRef.current = false
      onTyping(false)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  return (
    <div className="border-t border-border bg-background px-3 py-3 w-full"> 
      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full"> 
    
        {/* Text input */} 
        <textarea 
          ref={textareaRef} 
          value={content} 
          onChange={handleChange} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault() 
              handleSend()
            } 
          }} 
          placeholder="Message..." 
          rows={1} 
          maxLength={2000} 
          className="flex-1 bg-accent border border-border rounded-2xl px-4 py-2 
                     text-sm resize-none outline-none focus:ring-1 focus:ring-primary/20 
                     min-h-[40px] max-h-[120px] overflow-y-auto transition-all" 
          style={{ height: 'auto' }} 
        /> 
    
        {/* Send button */} 
        <button 
          onClick={handleSend} 
          disabled={!content.trim() || sending} 
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-0.5 
                      transition-all ${content.trim() && !sending 
                        ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20' 
                        : 'bg-accent text-muted-foreground cursor-not-allowed' 
                      }`} 
        > 
          {sending 
            ? <Loader2 className="w-5 h-5 animate-spin" /> 
            : <Send className="w-5 h-5" /> 
          } 
        </button> 
      </div> 
    
      {/* Character counter — show when > 1800 */} 
      {content.length > 1800 && ( 
        <p className={`text-[10px] text-right mt-1 ${ 
          content.length > 2000 ? 'text-destructive' : 'text-muted-foreground' 
        }`}> 
          {content.length}/2000 
        </p> 
      )} 
    </div> 
  )
}
