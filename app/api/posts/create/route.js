import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';
import { extractHashtags } from '@/utils/hashtags';
import { indexHashtags } from '@/lib/hashtag-utils';
import { awardXP } from '@/lib/xp';
import { deleteCachePattern } from '@/lib/cache';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Rate limit post creation - 10 posts per hour per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'post_create',
      10,
      60 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { content, community, isAnonymous, poll } = body;

    await connectDB();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const sanitizedContent = sanitizeString(content);
    if (sanitizedContent.length > 500) {
      return NextResponse.json({ message: 'Post too long' }, { status: 400 });
    }

    const hashtags = extractHashtags(sanitizedContent);

    // Poll validation
    let pollData = null;
    if (poll && Array.isArray(poll) && poll.length > 0) {
      const trimmedOptions = poll
        .map(opt => typeof opt === 'string' ? opt.trim() : '')
        .filter(opt => opt.length > 0);
      
      const uniqueOptions = [...new Set(trimmedOptions)];

      if (uniqueOptions.length < 2 || uniqueOptions.length > 4) {
        return NextResponse.json({ message: 'Poll must have 2-4 unique options' }, { status: 400 });
      }

      if (uniqueOptions.some(opt => opt.length > 80)) {
        return NextResponse.json({ message: 'Poll options must be under 80 characters' }, { status: 400 });
      }

      pollData = {
        options: uniqueOptions.map(text => ({ text, votes: [] })),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        active: true
      };
    }

    const post = await Post.create({
      author: currentUser._id,
      content: sanitizedContent,
      community: community || '',
      isAnonymous: isAnonymous || false,
      poll: pollData,
      hashtags
    });

    await post.populate('author', 'name username avatar college');

    // Invalidate community-related caches
    deleteCachePattern('communities_');

    // Index hashtags in background
    indexHashtags(hashtags).catch(err => console.error('Background hashtag indexing error:', err));

    // Award XP for posting
    const xpResult = await awardXP(currentUser._id, 'post');

    return NextResponse.json({
      ...post.toObject(),
      xpAwarded: xpResult.xpAwarded,
      newXP: xpResult.newXP,
      newLevel: xpResult.newLevel,
      leveledUp: xpResult.leveledUp
    }, { status: 201 });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
