"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/shared/EmptyState";
import GroupChatItem from "@/components/chat/GroupChatItem";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import useUser from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdmin } from "@/lib/admin";
import { useTabData } from "@/hooks/useTabData";

export default function ChatsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const { user: currentUser } = useUser();
    const router = useRouter();

    const {
        data: groups,
        loading: groupsLoading,
        fetchData,
    } = useTabData(
        "chats-groups",
        async () => {
            const res = await fetch("/api/groups");
            if (!res.ok) throw new Error("Failed to fetch groups");
            const data = await res.json();
            return data.groups || [];
        },
        { ttl: 2 * 60 * 1000 }, // 2 minutes
    );

    useEffect(() => {
        if (!groups) {
            fetchData();
        }
    }, []);

    const filteredGroups = groups
        ? groups.filter((group) =>
              group.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b z-10 px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold">💬 Group Chats</h1>
                    {isAdmin(currentUser) && (
                        <Button
                            size="sm"
                            onClick={() => setCreateOpen(true)}
                            className="bg-primary text-primary-foreground hover:opacity-90"
                        >
                            <Plus className="w-4 h-4 mr-1" /> New Group
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm bg-accent/50 border-border/50 focus-visible:ring-primary/50"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {groupsLoading ? (
                    Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-4 py-3 border-b border-border/50"
                            >
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))
                ) : filteredGroups.length === 0 ? (
                    <div className="mt-20">
                        <EmptyState
                            icon={MessageSquare}
                            title={
                                searchQuery
                                    ? "No groups found"
                                    : "No group chats yet"
                            }
                            description={
                                searchQuery
                                    ? "Try searching for something else"
                                    : "Create a group or discover college groups"
                            }
                            actionLabel={searchQuery ? null : "Discover Groups"}
                            onAction={() => router.push("/chats/discover")}
                        />
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <GroupChatItem
                            key={group._id}
                            group={group}
                            currentUserId={currentUser?._id}
                            onClick={() => router.push(`/chats/${group._id}`)}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            <CreateGroupModal open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
