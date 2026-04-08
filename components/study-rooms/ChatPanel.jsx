"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { MessageSquare, X, Send, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher-client";

export default function ChatPanel({ roomId, currentUser, isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  
  const userId = currentUser?._id || "";
  const userName = currentUser?.name || "Anonymous";

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const fetchMessages = useCallback(async (before = null) => {
    try {
      const url = before 
        ? `/api/study-rooms/${roomId}/messages?before=${before}`
        : `/api/study-rooms/${roomId}/messages`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (before) {
          setMessages(prev => [...data, ...prev]);
        } else {
          setMessages(data);
        }
        setHasMore(data.length === 50);
      }
    } catch (error) {
      console.error("[Chat] Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    
    setLoadingMore(true);
    const firstMessageId = messages[0]?.id || messages[0]?._id;
    if (!firstMessageId) {
      setLoadingMore(false);
      return;
    }

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;
    const prevScrollTop = container?.scrollTop || 0;

    try {
      const res = await fetch(`/api/study-rooms/${roomId}/messages?before=${firstMessageId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...data, ...prev]);
        setHasMore(data.length === 50);
        
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
          }
        });
      }
    } catch (error) {
      console.error("[Chat] Failed to load more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [roomId, loadingMore, hasMore, messages]);

  useEffect(() => {
    if (!isOpen) return;
    
    fetchMessages();
    
    const pusher = getPusherClient();
    if (!pusher) return;
    
    const channelName = `private-room-${roomId}`;
    let channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("new-room-message", (data) => {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    });

    channel.bind("client-typing", (data) => {
      if (data.userId === userId) return;
      
      setTypingUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId);
        if (exists) return prev;
        return [...prev, { userId: data.userId, name: data.name }];
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers([]);
      }, 2000);
    });

    return () => {
      if (channel) {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, isOpen, fetchMessages, scrollToBottom, userId]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages.length, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    const originalContent = content;
    setContent("");
    setSending(true);

    try {
      const res = await fetch(`/api/study-rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }
    } catch (error) {
      console.error("[Chat] Send error:", error);
      setContent(originalContent);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [content, roomId, sending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e) => {
    setContent(e.target.value);
    
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 2000 && channelRef.current?.subscribed) {
      lastTypingEmitRef.current = now;
      try {
        channelRef.current.trigger("client-typing", {
          userId,
          name: userName,
        });
      } catch (e) {}
    }
  }, [userId, userName]);

  if (!isOpen) return null;

  return (
    <aside className="w-80 h-full border-l border-zinc-800 bg-zinc-900 flex flex-col shrink-0 transition-all duration-200">
      <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-100">Room Chat</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggle(false)}
          className="text-zinc-400 hover:text-zinc-200 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="w-full text-xs text-zinc-500 hover:text-zinc-300"
              >
                {loadingMore ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                Load earlier messages
              </Button>
            )}
            
            {messages.map((msg, index) => {
              if (msg.type === "system") {
                return (
                  <div key={msg.id || index} className="text-center py-1">
                    <span className="text-xs text-zinc-500 italic">
                      — {msg.content} —
                    </span>
                  </div>
                );
              }

              const isOwn = msg.sender?._id === userId || msg.sender?._id === userId;
              const senderName = msg.sender?.name || "User";
              const avatar = msg.sender?.avatar;
              const initial = senderName?.[0]?.toUpperCase() || "U";

              return (
                <div
                  key={msg.id || index}
                  className="group hover:bg-zinc-800/50 rounded px-2 py-1 -mx-2 transition-colors duration-150"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt={senderName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-zinc-300 font-medium">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isOwn ? "text-blue-400" : "text-zinc-200"}`}>
                          {senderName}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ""}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-zinc-500 animate-pulse">
          {typingUsers[0].name}
          {typingUsers.length > 1 && ` and ${typingUsers.length - 1} more`}
          {" "}is typing...
        </div>
      )}

      <div className="p-3 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            maxLength={500}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
