
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import User from '@/models/User';
import Post from '@/models/Post';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(req) {
  await dbConnect();
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { postId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    const user = await User.findById(token.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const wasBookmarked = user.bookmarks.includes(postId);
    let updatedUser;

    if (wasBookmarked) {
      // Unbookmark
      updatedUser = await User.findByIdAndUpdate(
        token.id,
        { $pull: { bookmarks: postId } },
        { new: true }
      );
    } else {
      // Bookmark
      updatedUser = await User.findByIdAndUpdate(
        token.id,
        { $push: { bookmarks: postId } },
        { new: true }
      );
    }

    return NextResponse.json({
      bookmarked: !wasBookmarked,
      message: !wasBookmarked ? 'Saved' : 'Removed',
    });

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findById(token.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const total = user.bookmarks.length;
    const paginatedIds = user.bookmarks.slice(skip, skip + limit);

    const posts = await Post.find({ _id: { $in: paginatedIds } })
      .populate('author', 'name username avatar college')
      .lean();

    const originalOrder = paginatedIds.reduce((acc, id, index) => {
      acc[id.toString()] = index;
      return acc;
    }, {});

    const sortedPosts = posts.sort((a, b) => originalOrder[a._id.toString()] - originalOrder[b._id.toString()]);

    const postIdsFromDb = posts.map(p => p._id.toString());
    const deletedPostIds = paginatedIds.filter(id => !postIdsFromDb.includes(id.toString()));

    if (deletedPostIds.length > 0) {
      await User.findByIdAndUpdate(token.id, { $pull: { bookmarks: { $in: deletedPostIds } } });
    }

    return NextResponse.json({
      posts: sortedPosts,
      hasMore: total > page * limit,
      total,
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
