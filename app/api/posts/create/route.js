import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';
import { extractHashtags } from '@/utils/hashtags';
import { indexHashtags } from '@/lib/hashtag-utils';
import { awardXP } from '@/lib/xp';
import { awardCoins } from '@/lib/coins';
import { deleteCachePattern } from '@/lib/cache';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';

import { broadcastEvent } from '@/lib/notificationStream';

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

    const { content, community, isAnonymous, poll, linkPreview, images, isMarkdown } = body;

    await connectDB();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const sanitizedContent = sanitizeText(content);
    if (sanitizedContent.length > 2000) {
      return NextResponse.json({ message: 'Post too long (max 2000 chars)' }, { status: 400 });
    }

    const hashtags = extractHashtags(sanitizedContent);

    // Poll validation
    let pollData = null;
    if (poll && Array.isArray(poll) && poll.length > 0) {
      const trimmedOptions = poll
        .map(opt => typeof opt === 'string' ? sanitizeText(opt) : '')
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

    const isAnon = isAnonymous === true;
    const Model = isAnon ? AnonymousPost : Post;

    // Validate images array
    if (images !== undefined) {
      if (!Array.isArray(images) || images.length > 6) {
        return NextResponse.json({ message: 'Maximum 6 images allowed' }, { status: 400 });
      }
      if (images.some(url => typeof url !== 'string' || !url.trim())) {
        return NextResponse.json({ message: 'Invalid image URL in images array' }, { status: 400 });
      }
    }

    const postData = {
      content: sanitizedContent,
      community: sanitizeText(community) || '',
      isAnonymous: isAnon,
      poll: pollData,
      hashtags,
      images: Array.isArray(images) ? images : [],
      linkPreview: linkPreview ? {
        title: sanitizeText(linkPreview.title),
        description: sanitizeText(linkPreview.description),
        image: linkPreview.image,
        url: linkPreview.url
      } : null,
      isMarkdown: isMarkdown === true
    };

    if (!isAnon) {
      postData.author = currentUser._id;
    }

    const post = await Model.create(postData);

    if (!isAnon) {
      await post.populate('author', 'name username avatar college');
    }

    // Invalidate community-related caches
    deleteCachePattern('communities_');

    // Index hashtags in background
    indexHashtags(hashtags).catch(err => console.error('Background hashtag indexing error:', err));

    // Award XP for posting
    const xpResult = await awardXP(currentUser._id, 'post');

    // Award Coins for posting
    awardCoins(currentUser._id, 'post_created', post._id).catch(() => {});

    // Check first post of day
    const dayStart = new Date(); 
    dayStart.setHours(0, 0, 0, 0);
    const postsToday = await Model.countDocuments({
      author: currentUser._id,
      createdAt: { $gte: dayStart }
    });
    if (postsToday === 1) {
      awardCoins(currentUser._id, 'first_post_of_day', post._id).catch(() => {});
    }

    // Award Coins for poll creation
    if (post.poll) {
      awardCoins(currentUser._id, 'poll_created', post._id).catch(() => {});
    }

    // Broadcast new post event
    broadcastEvent({ 
      type: 'new_post', 
      postId: post._id, 
      community: post.community,
      author: post.isAnonymous ? 'Anonymous' : post.author.name
    });

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
