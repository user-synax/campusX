"use client"

import { useState } from 'react'
import Link from 'next/link'
import UserAvatar from "@/components/user/UserAvatar"
import { Trash2 } from 'lucide-react'
import ConfirmDeleteModal from './ConfirmDeleteModal'

export default function MessageBubble({ message, isOwn, showAvatar, currentUserId, onDelete, onReact }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(message._id)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  // SYSTEM MESSAGE
  if (message.type === 'system') {
    return (
      <div className="text-center my-2"> 
        <span className="text-[11px] text-muted-foreground bg-accent px-3 py-1 rounded-full"> 
          {message.content} 
        </span> 
      </div> 
    )
  }

  // DELETED MESSAGE
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}> 
        <div className="italic text-xs text-muted-foreground px-3 py-1.5 rounded-xl 
                        border border-border/50"> 
          🚫 Message deleted 
        </div> 
      </div> 
    )
  }

  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group relative`}> 
 
      {/* Avatar — show for other people only */} 
      {!isOwn && ( 
        <div className="flex-shrink-0 mb-1"> 
          {showAvatar ? ( 
            <Link href={`/profile/${message.sender.username}`}> 
              <UserAvatar user={message.sender} size="xs" /> 
            </Link> 
          ) : ( 
            <div className="w-6" />  // spacer 
          )} 
        </div> 
      )} 
 
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}> 
 
        {/* Sender name — show only for others, only if showAvatar */} 
        {!isOwn && showAvatar && ( 
          <p className="text-[10px] text-muted-foreground mb-1 px-1"> 
            {message.sender.name} 
          </p> 
        )} 
 
        {/* Message bubble */} 
        <div 
          className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed 
            ${isOwn 
              ? 'bg-primary text-primary-foreground rounded-br-sm' 
              : 'bg-card border border-border rounded-bl-sm' 
            }`} 
        > 
          {/* Image message */} 
          {message.type === 'image' && message.imageUrl && ( 
            <div className="mb-1 rounded-xl overflow-hidden"> 
              <img 
                src={message.imageUrl} 
                alt="Shared"
                className="max-w-full max-h-60 object-cover cursor-pointer" 
                onClick={() => window.open(message.imageUrl, '_blank')} 
                loading="lazy" 
              /> 
            </div> 
          )} 
 
          {/* Text content */} 
          {message.content && ( 
            <p className="whitespace-pre-wrap break-words"> 
              {message.content} 
            </p> 
          )} 
 
          {/* Timestamp */} 
          <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}> 
            {new Date(message.createdAt).toLocaleTimeString('en-IN', { 
              hour: '2-digit', minute: '2-digit', hour12: true 
            })} 
          </p> 
        </div> 
 
        {/* Reactions */} 
        {message.reactions?.length > 0 && ( 
          <div className="flex flex-wrap gap-1 mt-1 px-1"> 
            {Object.entries( 
              message.reactions.reduce((acc, r) => { 
                acc[r.emoji] = (acc[r.emoji] || 0) + 1 
                return acc 
              }, {}) 
            ).map(([emoji, count]) => ( 
              <button 
                key={emoji} 
                onClick={() => onReact(message._id, emoji)} 
                className="flex items-center gap-0.5 bg-accent border border-border 
                           rounded-full px-2 py-0.5 text-xs hover:bg-accent/80" 
              > 
                <span>{emoji}</span> 
                <span className="text-muted-foreground">{count}</span> 
              </button> 
            ))} 
          </div> 
        )} 
      </div> 
 
      {/* Action buttons — visible on hover */} 
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity 
                       flex flex-col gap-1 ${isOwn ? 'mr-1' : 'ml-1'}`}> 
        {/* React */} 
        <button 
          onClick={() => setShowReactionPicker(!showReactionPicker)} 
          className="w-6 h-6 rounded-full bg-accent border border-border 
                     flex items-center justify-center text-xs hover:bg-accent/80" 
        > 
          😊 
        </button> 
        {/* Delete own messages */} 
        {isOwn && ( 
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="w-6 h-6 rounded-full bg-accent border border-border 
                       flex items-center justify-center hover:bg-destructive/10 hover:border-destructive" 
          > 
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" /> 
          </button> 
        )} 
      </div> 
 
      {/* Reaction picker */} 
      {showReactionPicker && ( 
        <div className={`absolute bottom-full mb-1 bg-card border border-border 
                        rounded-full px-2 py-1 flex gap-1 shadow-lg z-10 ${isOwn ? 'right-0' : 'left-0'}`}> 
          {['❤️', '😂', '👍', '🔥', '😮', '😢','🥀'].map(emoji => ( 
            <button 
              key={emoji} 
              onClick={() => { 
                onReact(message._id, emoji) 
                setShowReactionPicker(false) 
              }} 
              className="text-lg hover:scale-125 transition-transform" 
            > 
              {emoji} 
            </button> 
          ))} 
        </div> 
      )} 

      {/* Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div> 
  )
}
