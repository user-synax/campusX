"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle,
    Loader2,
    ShieldAlert,
    Eye,
    EyeOff,
    Trash2,
    Check,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/user/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const REPORT_REASON_LABELS = {
    spam: "Spam / Misleading",
    harassment: "Harassment / Bullying",
    inappropriate: "Inappropriate",
    misinformation: "Misinformation",
    other: "Other",
};

export default function AdminReportedContent() {
    const [reportedPosts, setReportedPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postsRes, reportsRes] = await Promise.all([
                fetch("/api/admin/content/reported"),
                fetch("/api/reports?status=pending"),
            ]);

            const postsData = await postsRes.json();
            const reportsData = await reportsRes.json();

            setReportedPosts(postsData.posts || []);
            setReports(reportsData.reports || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleContentAction = async (postId, action) => {
        try {
            const res = await fetch(`/api/admin/content/${postId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, reason: "Admin moderation" }),
            });

            if (res.ok) {
                toast.success(`Action ${action} performed successfully`);
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || "Action failed");
            }
        } catch (error) {
            console.error("Content action failed:", error);
            toast.error("Network error");
        }
    };

    const handleDismissReport = async (reportId) => {
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "dismissed" }),
            });

            if (res.ok) {
                toast.success("Report dismissed");
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to dismiss report");
            }
        } catch (error) {
            console.error("Dismiss report failed:", error);
            toast.error("Network error");
        }
    };

    if (loading && reportedPosts.length === 0 && reports.length === 0) {
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="p-4 border-b border-border sticky top-[105px] bg-background z-10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        Moderation
                    </h2>
                    <Button variant="ghost" size="sm" onClick={fetchData}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="px-4">
                    <TabsList className="bg-muted/50 p-1 w-full justify-start">
                        <TabsTrigger value="posts" className="text-xs">
                            Reported Posts ({reportedPosts.length})
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="text-xs">
                            Reports ({reports.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="posts" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {reportedPosts.length > 0 ? (
                            reportedPosts.map((post) => (
                                <div
                                    key={post._id}
                                    className="border border-border/50 rounded-xl m-3 overflow-hidden bg-accent/10 hover:bg-accent/20 transition-colors"
                                >
                                    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between">
                                        <span className="text-[11px] text-red-400 font-black uppercase tracking-wider">
                                            🚨 {post.reportCount} report
                                            {post.reportCount !== 1 ? "s" : ""}
                                        </span>
                                        {post.isHidden && (
                                            <span className="text-[10px] text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full bg-amber-400/10 font-bold uppercase tracking-tight">
                                                Hidden
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <UserAvatar
                                                user={post.author}
                                                size="xs"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    {post.author?.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    @{post.author?.username} ·{" "}
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            post.createdAt,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-background/40 p-3 rounded-lg border border-border/30">
                                            <p className="text-sm line-clamp-4 whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                        </div>
                                        {post.images?.length > 0 && (
                                            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-muted-foreground bg-accent/20 px-2 py-1 rounded w-fit">
                                                📷 {post.images.length} image
                                                {post.images.length !== 1
                                                    ? "s"
                                                    : ""}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 px-4 pb-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-[10px] font-bold h-9 bg-background border-border/50 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 uppercase tracking-tight"
                                            onClick={() =>
                                                handleContentAction(
                                                    post._id,
                                                    "clear_reports",
                                                )
                                            }
                                        >
                                            ✅ Safe
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={`flex-1 text-[10px] font-bold h-9 bg-background border-border/50 uppercase tracking-tight ${
                                                post.isHidden
                                                    ? "text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                                                    : "text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                                            }`}
                                            onClick={() =>
                                                handleContentAction(
                                                    post._id,
                                                    post.isHidden
                                                        ? "unhide"
                                                        : "hide",
                                                )
                                            }
                                        >
                                            {post.isHidden
                                                ? "👁 Unhide"
                                                : "🙈 Hide"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="flex-1 text-[10px] font-bold h-9 uppercase tracking-tight"
                                            onClick={() =>
                                                handleContentAction(
                                                    post._id,
                                                    "delete",
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-20 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                    <CheckCircle className="w-12 h-12" />
                                    <p className="text-sm font-medium">
                                        Inbox zero! No reported content to
                                        review.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div
                                    key={report._id}
                                    className="border border-border/50 rounded-xl m-3 overflow-hidden bg-accent/10 hover:bg-accent/20 transition-colors"
                                >
                                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
                                        <span className="text-[11px] text-amber-400 font-black uppercase tracking-wider">
                                            📝{" "}
                                            {REPORT_REASON_LABELS[
                                                report.reason
                                            ] || report.reason}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(report.createdAt),
                                                { addSuffix: true },
                                            )}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <UserAvatar
                                                user={report.reportedBy}
                                                size="xs"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    @
                                                    {
                                                        report.reportedBy
                                                            ?.username
                                                    }
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Reporter
                                                </p>
                                            </div>
                                        </div>

                                        {report.postId && (
                                            <>
                                                <div className="bg-background/40 p-3 rounded-lg border border-border/30 mb-2">
                                                    <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                                                        {report.postId.content}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <UserAvatar
                                                        user={
                                                            report.postId.author
                                                        }
                                                        size="xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">
                                                            {
                                                                report.postId
                                                                    .author
                                                                    ?.name
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            @
                                                            {
                                                                report.postId
                                                                    .author
                                                                    ?.username
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {report.description && (
                                            <div className="bg-muted/30 p-2 rounded text-xs text-muted-foreground mb-2">
                                                "{report.description}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 px-4 pb-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-[10px] font-bold h-9 bg-background border-border/50 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 uppercase tracking-tight"
                                            onClick={() =>
                                                report.postId &&
                                                handleContentAction(
                                                    report.postId._id,
                                                    "delete",
                                                )
                                            }
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Remove Post
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-[10px] font-bold h-9 bg-background border-border/50 uppercase tracking-tight"
                                            onClick={() =>
                                                handleDismissReport(report._id)
                                            }
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-20 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                    <CheckCircle className="w-12 h-12" />
                                    <p className="text-sm font-medium">
                                        No pending reports.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
