"use client";

import { FileText, Users, Zap } from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import dynamic from "next/dynamic";
import PostCard from "@/components/post/PostCard";
import PostSkeleton from "@/components/post/PostSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { usePosts } from "@/hooks/usePosts";
import useUser from "@/hooks/useUser";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useNotifications } from "@/hooks/useNotifications";
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel";
import PushPromptManager from "@/components/notifications/PushPromptManager";
import CommunitySwitcher from "@/components/feed/CommunitySwitcher";

// Lazy load heavy components
const PostComposer = dynamic(() => import("@/components/post/PostComposer"), {
    ssr: false,
    loading: () => (
        <div className="border-b border-border p-4 animate-pulse">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-accent" />
                <div className="flex-1 h-10 bg-accent rounded-lg" />
            </div>
        </div>
    ),
});

export default function FeedPage() {
    const { user: currentUser, refetch: refetchCurrentUser } = useUser();
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [isLatestMode, setIsLatestMode] = useState(false); // false = default/random, true = latest 8h

    const {
        posts,
        loading,
        error,
        hasMore,
        loadMore,
        addPost,
        removePost,
        updatePostLike,
        refresh: refreshPosts,
    } = usePosts({
        ...(selectedCommunity && { community: selectedCommunity }),
        mode: isLatestMode ? "latest8h" : "default",
    });

    const parentRef = useRef(null);
    const [scrollMargin, setScrollMargin] = useState(0);

    // Reset isFetched when mode changes
    const [modeKey, setModeKey] = useState(0);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModeKey((prev) => prev + 1);
    }, [isLatestMode, selectedCommunity]);

    useEffect(() => {
        if (parentRef.current) {
            setScrollMargin(parentRef.current.offsetTop);
        }
    }, [posts.length]);

    const postsVirtualizer = useWindowVirtualizer({
        count: posts.length,
        estimateSize: () => 350,
        overscan: 5,
        scrollMargin: scrollMargin,
        key: modeKey, // Reset virtualizer when mode changes
    });

    const { newNotification } = useNotifications();

    const handleRefreshFeed = useCallback(() => {
        refreshPosts();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [refreshPosts]);

    // Listen for refresh events from the floating refresh button
    useEffect(() => {
        const handleRefreshEvent = () => {
            refreshPosts();
        };
        window.addEventListener("cx-refresh-feed", handleRefreshEvent);
        return () =>
            window.removeEventListener("cx-refresh-feed", handleRefreshEvent);
    }, [refreshPosts]);

    const { sentinelRef } = useInfiniteScroll({
        fetchMore: loadMore,
        hasMore,
        loading,
    });

    const handlePostCreated = useCallback(
        (newPost) => {
            addPost(newPost);
            if (newPost.xpAwarded) {
                refetchCurrentUser();
                // Dispatch update event for sidebar/mobile XP bars
                window.dispatchEvent(new CustomEvent("cx-xp-updated"));
            }
        },
        [addPost, refetchCurrentUser],
    );

    const handleDeletePost = useCallback(
        (postId) => {
            removePost(postId);
        },
        [removePost],
    );

    const handleLikePost = useCallback(
        async (postId) => {
            return await updatePostLike(postId);
        },
        [updatePostLike],
    );

    const toggleMode = useCallback(() => {
        setIsLatestMode((prev) => !prev);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Feed header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
                        Hey, {currentUser?.name || "User"}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Welcome to your campus feed
                    </p>
                </div>
                <CommunitySwitcher
                    selectedCommunity={selectedCommunity}
                    onSelect={setSelectedCommunity}
                />
            </div>

            {/* Post composer */}
            <PostComposer
                onPostCreated={handlePostCreated}
                defaultCommunity={selectedCommunity}
            />

            {/* New Button */}
            <div className="sticky top-auto z-10 border-b border-border bg-background/80 backdrop-blur-md p-3">
                <button
                    onClick={toggleMode}
                    className={`
            w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
            ${
                isLatestMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }
          `}
                >
                    <Zap size={18} />
                    {isLatestMode ? "Turn Off" : "Show New Posts"}
                </button>
            </div>

            {/* Push permission banner */}
            <PushPromptManager newNotification={newNotification} />

            {/* Posts list */}
            <div className="flex-1">
                {loading && posts.length === 0 ? (
                    Array(5)
                        .fill(0)
                        .map((_, i) => <PostSkeleton key={i} />)
                ) : posts.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={
                            isLatestMode
                                ? "No new posts in 8 hours"
                                : "No posts yet"
                        }
                        description={
                            isLatestMode
                                ? "Check back later for new posts"
                                : selectedCommunity
                                  ? `Be the first to post in ${selectedCommunity}!`
                                  : "Be the first to post what's happening on campus!"
                        }
                    />
                ) : (
                    <>
                        <div
                            ref={parentRef}
                            className="divide-y divide-border relative w-full"
                        >
                            <div
                                style={{
                                    height: `${postsVirtualizer.getTotalSize()}px`,
                                    width: "100%",
                                    position: "relative",
                                }}
                            >
                                {postsVirtualizer
                                    .getVirtualItems()
                                    .map((virtualRow) => {
                                        const post = posts[virtualRow.index];
                                        if (!post) return null;
                                        return (
                                            <div
                                                key={post._id}
                                                ref={
                                                    postsVirtualizer.measureElement
                                                }
                                                data-index={virtualRow.index}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    transform: `translateY(${virtualRow.start - postsVirtualizer.options.scrollMargin}px)`,
                                                }}
                                            >
                                                <PostCard
                                                    post={post}
                                                    currentUserId={
                                                        currentUser?._id
                                                    }
                                                    onDelete={handleDeletePost}
                                                    onLike={handleLikePost}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        <div ref={sentinelRef}>
                            <InfiniteScrollSentinel
                                loading={loading}
                                hasMore={hasMore}
                                error={error}
                                onRetry={loadMore}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
