import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Community from "@/models/Community";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeMongoInput, sanitizeUser } from "@/lib/sanitize";
import { cacheWithFallback } from "@/lib/redis-cache";

export async function GET(request) {
    try {
        const currentUser = await getCurrentUser(request);
        const { searchParams } = new URL(request.url);

        const cursor = searchParams.get("cursor");
        const limit = Math.min(parseInt(searchParams.get("limit")) || 15, 50);
        const community = sanitizeMongoInput(searchParams.get("community"));
        const author = sanitizeMongoInput(searchParams.get("author"));
        const username = sanitizeMongoInput(searchParams.get("username"));
        const mode = sanitizeMongoInput(searchParams.get("mode")) || "default"; // default or latest8h

        // Create a cache key based on query params
        const cacheKey = `feed:${community || "global"}:${author || username || "all"}:${mode}:${cursor || "start"}:${limit}`;

        await connectDB();

        const postsData = await cacheWithFallback(cacheKey, 90, async () => {
            const query = { isDeleted: { $ne: true } };

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

            let posts;
            if (mode === "default") {
                // Use aggregation for random posts (random sampling)
                const pipeline = [
                    { $match: query },
                    { $sample: { size: limit + 1 } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "_id",
                            as: "author",
                        },
                    },
                    { $unwind: "$author" },
                    {
                        $project: {
                            likes: 0,
                            __v: 0,
                            updatedAt: 0,
                            "author.password": 0,
                            "author.email": 0,
                            "author.__v": 0,
                            "author.createdAt": 0,
                            "author.updatedAt": 0,
                        },
                    },
                ];
                posts = await Post.aggregate(pipeline);
            } else {
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

                const { likes, author: postAuthor, ...postData } = post;

                return {
                    ...postData,
                    likesCount: post.likesCount ?? post.likes?.length ?? 0,
                    shareCount: post.shareCount ?? 0,
                    author: sanitizeUser(postAuthor),
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
