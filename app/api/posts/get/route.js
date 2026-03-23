import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils';
import { sanitizeMongoInput, sanitizeUser } from '@/lib/sanitize';
import { attachEquippedToItems } from '@/lib/equipped-helpers';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const community = sanitizeMongoInput(searchParams.get('community'));
    const username = sanitizeMongoInput(searchParams.get('username'));

    await connectDB();

    const query = {};
    if (community) {
      const escapedCommunity = community.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.community = { $regex: new RegExp(`^${escapedCommunity}$`, 'i') };
    }

    if (username) {
      const user = await User.findOne({ username: username.toString() })
        .select('_id')
        .lean();
      if (user) {
        query.author = user._id;
      } else {
        return NextResponse.json({ posts: [], hasMore: false, total: 0 });
      }
    }

    const skip = (page - 1) * limit;

    // Use aggregation to union Post and AnonymousPost collections
    // Only union if not filtering by username (profile view)
    let posts;
    let total;

    if (username) {
      // Profile view: Only show regular posts
      [posts, total] = await Promise.all([
        Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name username avatar college')
          .lean(),
        Post.countDocuments(query),
      ]);
    } else {
      // Global feed or community view: Show both regular and anonymous posts
      // Use $unionWith for efficient merging and sorting
      const pipeline = [
        { $match: query },
        {
          $unionWith: {
            coll: 'anonymousposts',
            pipeline: [{ $match: query }]
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      posts = await Post.aggregate(pipeline);
      
      // Populate author for regular posts
      posts = await Post.populate(posts, {
        path: 'author',
        select: 'name username avatar college'
      });

      // For total count
      const postCount = await Post.countDocuments(query);
      const anonCount = await AnonymousPost.countDocuments(query);
      total = postCount + anonCount;
    }

    // Add reaction summary and user reaction status
    const postsWithReactions = posts.map(post => {
      const summary = computeReactionSummary(post.reactions, post.likes);
      const userReaction = currentUser ? getUserReaction(post.reactions, currentUser._id, post.likes) : null;
      const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;
      const isBookmarked = currentUser && currentUser.bookmarks ? 
        currentUser.bookmarks.some(id => id.toString() === post._id.toString()) : false;
      
      // Remove raw reactions and likes for privacy/payload size
      const { reactions, likes, author, ...postData } = post;
      
      return {
        ...postData,
        likesCount: post.likesCount ?? post.likes?.length ?? 0,
        author: sanitizeUser(author),
        _reactionSummary: summary,
        _userReaction: userReaction,
        _isLiked: isLiked,
        _isBookmarked: isBookmarked
      };
    });

    // Attach equipped visuals in batch
    const postsWithEquipped = await attachEquippedToItems(postsWithReactions);

    return NextResponse.json({
      posts: postsWithEquipped,
      hasMore: skip + posts.length < total,
      page,
      total,
    });
  } catch (error) {
    console.error('Post fetching error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
