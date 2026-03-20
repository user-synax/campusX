import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils';

// POST /api/bookmarks - Toggle bookmark
export async function POST(request) {
  try {
    const currentUserInfo = await getCurrentUser(request);
    if (!currentUserInfo) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { postId } = body;

    if (!postId || !validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const currentUser = await User.findById(currentUserInfo._id);
    const wasBookmarked = currentUser.bookmarks.includes(postId);

    if (wasBookmarked) {
      // Unbookmark
      currentUser.bookmarks.pull(postId);
    } else {
      // Bookmark
      currentUser.bookmarks.push(postId);
    }

    await currentUser.save();

    return NextResponse.json({
      bookmarked: !wasBookmarked,
      message: !wasBookmarked ? 'Saved' : 'Removed'
    });
  } catch (error) {
    console.error('Bookmark toggle error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/bookmarks - Fetch paginated bookmarks
export async function GET(request) {
  try {
    const currentUserInfo = await getCurrentUser(request);
    if (!currentUserInfo) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    await connectDB();

    // Get the user with bookmarks array
    const user = await User.findById(currentUserInfo._id).select('bookmarks').lean();
    
    // Sort bookmarks to have newest first (Mongoose push adds to end, so we reverse it)
    // The instructions don't explicitly say newest first, but it's common for bookmarks.
    // However, the instructions say "Sort by the ORDER they were bookmarked". 
    // Usually that means newest first. Let's assume newest first (reversed bookmarks array).
    const allBookmarks = [...user.bookmarks].reverse();
    const total = allBookmarks.length;
    const paginatedIds = allBookmarks.slice(skip, skip + limit);

    if (paginatedIds.length === 0) {
      return NextResponse.json({ posts: [], hasMore: false, total });
    }

    // Populate posts
    const posts = await Post.find({ _id: { $in: paginatedIds } })
      .populate('author', 'name username avatar college')
      .lean();

    // Filter out null results (posts that were deleted)
    // Also, preserve the order of bookmarks
    const postsMap = posts.reduce((acc, post) => {
      acc[post._id.toString()] = post;
      return acc;
    }, {});

    const orderedPosts = paginatedIds
      .map(id => postsMap[id.toString()])
      .filter(post => !!post);

    // Identify deleted post IDs that were still in the bookmarks
    const foundIds = orderedPosts.map(p => p._id.toString());
    const deletedIds = paginatedIds.filter(id => !foundIds.includes(id.toString()));

    // Clean up deleted post IDs in the background
    if (deletedIds.length > 0) {
      User.updateOne(
        { _id: currentUserInfo._id },
        { $pull: { bookmarks: { $in: deletedIds } } }
      ).catch(err => console.error('Background bookmark cleanup error:', err));
    }

    const sortedPosts = orderedPosts.map(post => {
      const summary = computeReactionSummary(post.reactions, post.likes);
      const userReaction = getUserReaction(post.reactions, currentUserInfo._id, post.likes);
      
      const { reactions, likes, ...postData } = post;
      
      return {
        ...postData,
        _reactionSummary: summary,
        _userReaction: userReaction
      };
    });

    return NextResponse.json({
      posts: sortedPosts,
      hasMore: skip + paginatedIds.length < total,
      total
    });
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
