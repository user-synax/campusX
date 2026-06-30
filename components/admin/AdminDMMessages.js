"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, MessageSquare, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUser from "@/hooks/useUser";
import MessageBubble from "@/components/chat/MessageBubble";
import EmptyState from "@/components/shared/EmptyState";

export default function AdminDMMessages() {
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingDm, setSendingDm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchConversations = async (search = "") => {
        try {
            setLoading(true);
            const url = search
                ? `/api/admin/dms?search=${encodeURIComponent(search)}`
                : "/api/admin/dms";
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setConversations(data.conversations || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversation = async (conversationId) => {
        try {
            setLoadingMessages(true);
            const res = await fetch(`/api/admin/dms/${conversationId}`);
            const data = await res.json();
            if (res.ok) {
                setSelectedConversation(data.conversation);
                setMessages(data.messages || []);
                setHasMore(data.hasMore);
                setCursor(data.nextCursor);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchConversations(searchQuery);
    };

    const getOtherParticipant = (conversation) => {
        if (!user) return null;
        const other = conversation.participants.find(
            (p) => p.userId?._id !== user._id,
        );
        return other?.userId;
    };

    return (
        <div className="flex h-[calc(100vh-200px)] border border-border rounded-xl overflow-hidden">
            {/* Left: Conversations list */}
            <div className="w-80 border-r border-border flex flex-col bg-accent/30">
                <div className="p-3 border-b border-border">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm h-9 bg-background/80"
                        />
                        <Button type="submit" size="sm" variant="secondary">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No conversations found
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const other = getOtherParticipant(conv);
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => fetchConversation(conv._id)}
                                    className={`p-3 border-b border-border/50 cursor-pointer hover:bg-accent/70 transition-colors ${selectedConversation?._id === conv._id ? "bg-accent/80" : ""}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold truncate">
                                            {other?.name ||
                                                other?.username ||
                                                "Unknown User"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {conv.lastMessage?.content ||
                                            "No messages"}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right: Messages */}
            <div className="flex-1 flex flex-col bg-background">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptyState
                            icon={MessageSquare}
                            title="Select a conversation"
                            description="Choose a DM from the list to view messages"
                        />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-3 border-b border-border flex items-center justify-between bg-accent/20">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() =>
                                        setSelectedConversation(null)
                                    }
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <span className="font-semibold text-sm">
                                    Conversation
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No messages in this conversation
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble
                                        key={msg._id}
                                        message={msg}
                                        isOwn={false}
                                        showAvatar={true}
                                        currentUserId={null}
                                        onDelete={() => {}}
                                        onReact={() => {}}
                                        onReply={() => {}}
                                        sending={sendingDm}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
