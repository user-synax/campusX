"use client";

import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Eye,
    EyeOff,
    Ban,
    CheckCircle,
    X,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/user/UserAvatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminBlockedContent() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/blocked-content");
            const data = await res.json();
            if (res.ok) {
                setAttempts(data.attempts || []);
            }
        } catch (error) {
            console.error("Failed to fetch blocked attempts", error);
            toast.error("Failed to load blocked content");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (attemptId, newStatus) => {
        try {
            const res = await fetch("/api/admin/blocked-content", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attemptId, status: newStatus }),
            });
            if (res.ok) {
                toast.success("Status updated");
                fetchAttempts();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const statusColors = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        dismissed: "bg-gray-500/10 text-gray-400 border-gray-500/30",
        actioned: "bg-red-500/10 text-red-400 border-red-500/30",
    };

    const violationColors = {
        sexual: "bg-pink-500/10 text-pink-400 border-pink-500/30",
        violence: "bg-red-500/10 text-red-400 border-red-500/30",
        harmful: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        spam: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Blocked Content Attempts ({attempts.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={fetchAttempts}>
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attempts.map((attempt) => (
                    <div
                        key={attempt._id}
                        className="border border-border rounded-xl overflow-hidden bg-accent/10"
                    >
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserAvatar user={attempt.userId} size="sm" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {attempt.userId?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        @{attempt.userId?.username}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                className={
                                    statusColors[attempt.status] ||
                                    statusColors.pending
                                }
                            >
                                {attempt.status.charAt(0).toUpperCase() +
                                    attempt.status.slice(1)}
                            </Badge>
                        </div>

                        <div className="p-4">
                            <div className="mb-3 flex flex-wrap gap-2">
                                {attempt.detectedViolations.map((v) => (
                                    <Badge
                                        key={v}
                                        className={violationColors[v]}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                            <div className="bg-background/30 rounded-lg p-3 mb-3">
                                <p className="text-sm whitespace-pre-wrap">
                                    {attempt.content}
                                </p>
                            </div>
                            {attempt.community && (
                                <p className="text-xs text-muted-foreground mb-2">
                                    Community: {attempt.community}
                                </p>
                            )}
                            {attempt.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {attempt.tags.map((tag) => (
                                        <Badge
                                            variant="outline"
                                            key={tag}
                                            className="text-xs"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-muted-foreground mb-4">
                                {formatDistanceToNow(
                                    new Date(attempt.createdAt),
                                    {
                                        addSuffix: true,
                                    },
                                )}
                            </p>

                            {attempt.status === "pending" && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() =>
                                            updateStatus(
                                                attempt._id,
                                                "dismissed",
                                            )
                                        }
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Dismiss
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() =>
                                            updateStatus(
                                                attempt._id,
                                                "reviewed",
                                            )
                                        }
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Reviewed
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1 text-xs"
                                        onClick={() =>
                                            updateStatus(
                                                attempt._id,
                                                "actioned",
                                            )
                                        }
                                    >
                                        <Ban className="w-3 h-3 mr-1" />
                                        Action
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {attempts.length === 0 && !loading && (
                <div className="col-span-full p-16 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto opacity-20 mb-4" />
                    <p className="text-muted-foreground text-sm">
                        No blocked content to review
                    </p>
                </div>
            )}
        </div>
    );
}
