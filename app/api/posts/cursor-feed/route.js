import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Community from "@/models/Community";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeMongoInput, sanitizeUser } from "@/lib/sanitize";
import { cacheWithFallback } from "@/lib/redis-cache";

// Feed weights - easy to modify later!
const FEED_WEIGHTS = {
    interest: 60,
    sameCollege: 20,
    likes: 1,
    comments: 2,
};

// Calculate post score based on user's interests and other factors
function calculatePostScore(post, userInterests, userCollege) {
    let score = 0;

    // Interest match score
    if (userInterests && userInterests.length > 0 && post.tags) {
        const matchingInterests = post.tags.filter((tag) =>
            userInterests.includes(tag),
        );
        score += matchingInterests.length * FEED_WEIGHTS.interest;
    }

    // Same college score
    if (userCollege && post.author?.college === userCollege) {
        score += FEED_WEIGHTS.sameCollege;
    }

    // Engagement score
    score += (post.likesCount || 0) * FEED_WEIGHTS.likes;
    score += (post.commentsCount || 0) * FEED_WEIGHTS.comments;

    // Recency decay
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const hoursAgo = (now - postDate) / (1000 * 60 * 60);
    // Decay score by 5% every hour
    score *= Math.pow(0.95, hoursAgo);

    return score;
}

export async function GET(request) {
    try {
        const currentUser = await getCurrentUser(request);
        const { searchParams } = new URL(request.url);

        const cursor = searchParams.get("cursor");
        const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 50);
        const community = sanitizeMongoInput(searchParams.get("community"));
        const author = sanitizeMongoInput(searchParams.get("author"));
        const username = sanitizeMongoInput(searchParams.get("username"));
        const mode = sanitizeMongoInput(searchParams.get("mode")) || "default"; // default or latest8h
        const feedType = sanitizeMongoInput(searchParams.get("feedType")) || "discover"; // discover or interests

        // Create a cache key based on query params and current user (if logged in)
        const cacheKey = `feed:${community || "global"}:${author || username || "all"}:${mode}:${feedType}:${cursor || "start"}:${limit}:${currentUser?._id || "guest"}`;

        await connectDB();

        const postsData = await cacheWithFallback(cacheKey, 90, async () => {
            let query = { isDeleted: { $ne: true } };

            if (community) {
                query.community = {
                    $regex: new RegExp(
                        `^${community.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                        "i",
                    ),
                };
            }

            let resolvedAuthor = author;
            if (username) {
                const user = await User.findOne({
                    username: username.toString(),
                })
                    .select("_id")
                    .lean();
                if (user) {
                    resolvedAuthor = user._id;
                } else {
                    // User not found for username, return empty
                    return {
                        posts: [],
                        pagination: {
                            nextCursor: null,
                            hasNextPage: false,
                            limit,
                        },
                    };
                }
            }

            if (resolvedAuthor) {
                query.author = resolvedAuthor;
            }

            // Mode-specific queries
            if (mode === "latest8h") {
                const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
                query.createdAt = { $gte: eightHoursAgo };
            }

            if (cursor) {
                const decodedCursor = Buffer.from(cursor, "base64").toString(
                    "utf-8",
                );
                query._id = { $lt: decodedCursor };
            }

            let posts = [];

            if (feedType === "interests" && currentUser) {
                const userInterests = currentUser.interests || [];
                
                // Prioritize AI-related content
                const sortedInterests = [...userInterests].sort((a, b) => {
                    if (a === "AI") return -1;
                    if (b === "AI") return 1;
                    return 0;
                });

                if (sortedInterests.length > 0) {
                    const interestQuery = {
                        ...query,
                        tags: { $in: sortedInterests },
                    };

                    posts = await Post.find(interestQuery)
                        .sort({ createdAt: -1 })
                        .limit(limit + 1)
                        .select("-likes -__v -updatedAt")
                        .populate({
                            path: "author",
                            select: "name username avatar college isVerified verificationType",
                            options: { lean: true },
                        })
                        .lean();
                }
            } else { // feedType === 'discover'
                if (mode === "default" && currentUser) {
                    // --- First, get interest-matching posts ---
                    const userInterests = currentUser.interests || [];
                    const userCollege = currentUser.college || "";

                    let interestPosts = [];
                    let trendingPosts = [];
                    let discoveryPosts = [];

                    if (userInterests.length > 0) {
                        const interestQuery = {
                            ...query,
                            tags: { $in: userInterests },
                        };

                        interestPosts = await Post.find(interestQuery)
                            .sort({ createdAt: -1 })
                            .limit(Math.floor(limit * 1.5))
                            .select("-likes -__v -updatedAt")
                            .populate({
                                path: "author",
                                select: "name username avatar college isVerified verificationType",
                                options: { lean: true },
                            })
                            .lean();
                    }

                    // --- Get trending posts ---
                    const trendingQuery = { ...query };
                    trendingPosts = await Post.find(trendingQuery)
                        .sort({ likesCount: -1, createdAt: -1 })
                        .limit(Math.floor(limit * 0.5))
                        .select("-likes -__v -updatedAt")
                        .populate({
                            path: "author",
                            select: "name username avatar college isVerified verificationType",
                            options: { lean: true },
                        })
                        .lean();

                    // --- Get discovery posts (same college or recent) ---
                    let discoveryQuery = { ...query };
                    if (userCollege) {
                        discoveryQuery = {
                            ...query,
                            $or: [
                                { community: userCollege },
                                {
                                    createdAt: {
                                        $gte: new Date(
                                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                                        ),
                                    },
                                }, // Last 7 days
                            ],
                        };
                    } else {
                        discoveryQuery.createdAt = {
                            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        };
                    }

                    discoveryPosts = await Post.find(discoveryQuery)
                        .sort({ createdAt: -1 })
                        .limit(Math.floor(limit * 0.5))
                        .select("-likes -__v -updatedAt")
                        .populate({
                            path: "author",
                            select: "name username avatar college isVerified verificationType",
                            options: { lean: true },
                        })
                        .lean();

                    // Combine all posts, remove duplicates
                    const allPostsMap = new Map();
                    [...interestPosts, ...trendingPosts, ...discoveryPosts].forEach(
                        (post) => {
                            if (!allPostsMap.has(post._id.toString())) {
                                allPostsMap.set(post._id.toString(), post);
                            }
                        },
                    );
                    let allPosts = Array.from(allPostsMap.values());

                    // Score and sort posts
                    allPosts = allPosts.map((post) => ({
                        ...post,
                        _score: calculatePostScore(
                            post,
                            userInterests,
                            userCollege,
                        ),
                    }));
                    allPosts.sort((a, b) => b._score - a._score);

                    posts = allPosts.slice(0, limit + 1); // Take limit + 1 for pagination
                } else if (mode === "default" && !currentUser) {
                    // Not logged in - just show trending
                    posts = await Post.find(query)
                        .sort({ likesCount: -1, createdAt: -1 })
                        .limit(limit + 1)
                        .select("-likes -__v -updatedAt")
                        .populate({
                            path: "author",
                            select: "name username avatar college isVerified verificationType",
                            options: { lean: true },
                        })
                        .lean();
                } else {
                    // Other modes (latest8h, etc.)
                    posts = await Post.find(query)
                        .sort({ _id: -1 })
                        .limit(limit + 1)
                        .select("-likes -__v -updatedAt")
                        .populate({
                            path: "author",
                            select: "name username avatar college isVerified verificationType",
                            options: { lean: true },
                        })
                        .lean();
                }
            }

            const hasMore = posts.length > limit;
            const resultPosts = hasMore ? posts.slice(0, limit) : posts;

            // Fetch community details in parallel
            const communityNames = [
                ...new Set(resultPosts.map((p) => p.community).filter(Boolean)),
            ];
            const communities =
                communityNames.length > 0
                    ? await Community.find({
                          $or: [
                              { name: { $in: communityNames } },
                              {
                                  slug: {
                                      $in: communityNames.map((n) =>
                                          n.toLowerCase().replace(/\s+/g, "-"),
                                      ),
                                  },
                              },
                          ],
                      })
                          .select("name slug emoji")
                          .lean()
                    : [];

            const communityMap = communities.reduce((acc, c) => {
                acc[c.name.toLowerCase()] = c;
                acc[c.slug.toLowerCase()] = c;
                return acc;
            }, {});

            const processedPosts = resultPosts.map((post) => {
                const isLiked = currentUser
                    ? post.likes?.some(
                          (id) => id.toString() === currentUser._id.toString(),
                      )
                    : false;
                const isBookmarked =
                    currentUser && currentUser.bookmarks
                        ? currentUser.bookmarks.some(
                              (id) => id.toString() === post._id.toString(),
                          )
                        : false;

                const communityInfo = post.community
                    ? communityMap[post.community.toLowerCase()]
                    : null;

                const { likes, author: postAuthor, _score, ...postData } = post;
                const sanitizedAuthor = sanitizeUser(postAuthor);
                const safeAuthor = sanitizedAuthor || {
                    _id: null,
                    name: "Unknown",
                    username: "unknown",
                    avatar: null,
                    isVerified: false,
                };

                return {
                    ...postData,
                    likesCount: post.likesCount ?? post.likes?.length ?? 0,
                    shareCount: post.shareCount ?? 0,
                    author: safeAuthor,
                    _isLiked: isLiked,
                    _isBookmarked: isBookmarked,
                    communityInfo: communityInfo
                        ? {
                              name: communityInfo.name,
                              slug: communityInfo.slug,
                              emoji: communityInfo.emoji,
                          }
                        : null,
                };
            });

            const nextCursor = hasMore
                ? Buffer.from(
                      resultPosts[resultPosts.length - 1]._id.toString(),
                  ).toString("base64")
                : null;

            return {
                posts: processedPosts,
                pagination: {
                    nextCursor,
                    hasNextPage: hasMore,
                    limit,
                },
            };
        });

        return NextResponse.json(
            {
                success: true,
                ...postsData,
            },
            {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=90, stale-while-revalidate=60",
                    Vary: "Cookie",
                },
            },
        );
    } catch (error) {
        console.error("Cursor feed error:", error);
        return NextResponse.json(
            {
                success: false,
                error: { message: "Internal Server Error" },
            },
            { status: 500 },
        );
    }
}
