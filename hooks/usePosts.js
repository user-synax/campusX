"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import clientCache from "@/lib/client-cache";

export function usePosts(queryParams = {}, initialPosts = []) {
    // Use useMemo to create a stable cache key
    const cacheKey = useMemo(() => {
        return JSON.stringify(["feed", queryParams]);
    }, [queryParams]);

    const cachedData = clientCache.get(cacheKey);
    const [posts, setPosts] = useState(
        cachedData ? cachedData.posts : initialPosts,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(
        cachedData ? cachedData.hasMore : true,
    );
    const [cursor, setCursor] = useState(cachedData ? cachedData.cursor : null);
    const [isPrefetching, setIsPrefetching] = useState(false);

    const prefetchData = useRef(null);
    const isFetchedRef = useRef(false);
    const prevQueryParamsRef = useRef(queryParams);

    // Reset when query params change (e.g., mode switch)
    useEffect(() => {
        const paramsChanged =
            JSON.stringify(prevQueryParamsRef.current) !==
            JSON.stringify(queryParams);
        if (paramsChanged) {
            isFetchedRef.current = false;
            prevQueryParamsRef.current = queryParams;
            const newCached = clientCache.get(cacheKey);
            if (newCached) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPosts(newCached.posts);
                setHasMore(newCached.hasMore);
                setCursor(newCached.cursor);
            } else {
                setPosts([]);
                setHasMore(true);
                setCursor(null);
            }
        }
    }, [cacheKey, queryParams]);

    const fetchPosts = useCallback(
        async (currentCursor = null, append = false, forceRefresh = false) => {
            if (loading) return;
            if (
                !forceRefresh &&
                !append &&
                !isFetchedRef.current &&
                cachedData
            ) {
                console.log("Using cached data");
                isFetchedRef.current = true;
                return;
            }

            console.log(
                "Fetching posts, cursor:",
                currentCursor,
                "mode:",
                queryParams.mode,
            );
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    limit: 15,
                    ...queryParams,
                });
                if (currentCursor) params.set("cursor", currentCursor);

                const res = await fetch(
                    `/api/posts/cursor-feed?${params.toString()}`,
                );
                const data = await res.json();
                console.log("Fetched data:", data);

                if (!res.ok || !data.success) {
                    throw new Error(
                        data.error?.message || "Failed to fetch posts",
                    );
                }

                const { posts: newPosts, pagination } = data;

                setPosts((prevPosts) => {
                    let finalPosts;
                    if (!append) {
                        finalPosts = newPosts;
                    } else {
                        const existingIds = new Set(
                            prevPosts.map((p) => p._id),
                        );
                        const filteredNew = newPosts.filter(
                            (p) => !existingIds.has(p._id),
                        );
                        finalPosts = [...prevPosts, ...filteredNew];
                    }

                    // Cache the result for 3 minutes
                    const cacheValue = {
                        posts: finalPosts,
                        cursor: pagination.nextCursor,
                        hasMore: pagination.hasNextPage,
                    };
                    clientCache.set(cacheKey, cacheValue, 3 * 60 * 1000);

                    return finalPosts;
                });

                setHasMore(pagination.hasNextPage);
                setCursor(pagination.nextCursor);
                isFetchedRef.current = true;
            } catch (err) {
                console.error("fetchPosts error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [cacheKey, queryParams, cachedData],
    );

    // Initial load
    useEffect(() => {
        if (
            !isFetchedRef.current &&
            initialPosts.length === 0 &&
            posts.length === 0
        ) {
            console.log("Initial fetch triggered, cachedData:", cachedData);
            isFetchedRef.current = true;
            if (cachedData) {
                console.log("Cached data available");
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                fetchPosts(null, false);
            }
        }
    }, [queryParams, initialPosts, posts.length, cachedData, fetchPosts]);

    // Prefetch logic
    const prefetchNextPage = useCallback(async () => {
        if (
            !hasMore ||
            loading ||
            isPrefetching ||
            !cursor ||
            prefetchData.current
        )
            return;

        setIsPrefetching(true);
        try {
            const params = new URLSearchParams({
                limit: 15,
                cursor,
                ...queryParams,
            });

            const res = await fetch(
                `/api/posts/cursor-feed?${params.toString()}`,
            );
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    prefetchData.current = {
                        posts: data.posts,
                        nextCursor: data.pagination.nextCursor,
                        hasNextPage: data.pagination.hasNextPage,
                    };
                }
            }
        } catch (err) {
            console.error("Prefetch failed:", err);
        } finally {
            setIsPrefetching(false);
        }
    }, [hasMore, loading, isPrefetching, cursor, queryParams]);

    // Load more
    const loadMore = useCallback(() => {
        if (!hasMore || loading) return;

        // If we have prefetched data, use it
        if (prefetchData.current) {
            const {
                posts: prefetchedPosts,
                nextCursor,
                hasNextPage,
            } = prefetchData.current;
            prefetchData.current = null;

            setPosts((prevPosts) => {
                const existingIds = new Set(prevPosts.map((p) => p._id));
                const filteredNew = prefetchedPosts.filter(
                    (p) => !existingIds.has(p._id),
                );
                const finalPosts = [...prevPosts, ...filteredNew];

                // Update cache
                clientCache.set(
                    cacheKey,
                    {
                        posts: finalPosts,
                        cursor: nextCursor,
                        hasMore: hasNextPage,
                    },
                    3 * 60 * 1000,
                );

                return finalPosts;
            });

            setCursor(nextCursor);
            setHasMore(hasNextPage);
        } else {
            fetchPosts(cursor, true);
        }
    }, [cursor, hasMore, loading, fetchPosts, cacheKey]);

    const refresh = useCallback(async () => {
        isFetchedRef.current = false;
        setCursor(null);
        return fetchPosts(null, false, true);
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        addPost: (post) => {
            setPosts((prev) => [post, ...prev]);
            // Invalidate feed cache on new post
            clientCache.invalidate("feed");
        },
        removePost: (id) =>
            setPosts((prev) => prev.filter((p) => p._id !== id)),
        updatePostLike: async (postId) => {
            try {
                const res = await fetch("/api/posts/like", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postId }),
                });

                if (!res.ok) throw new Error("Failed to like post");

                const data = await res.json();

                setPosts((prev) =>
                    prev.map((p) => {
                        if (p._id === postId) {
                            return {
                                ...p,
                                likesCount: data.likesCount,
                                _isLiked: data.liked,
                            };
                        }
                        return p;
                    }),
                );

                return data;
            } catch (err) {
                console.error("Like error:", err);
                throw err;
            }
        },
    };
}
