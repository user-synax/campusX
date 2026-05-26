import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import Community from '@/models/Community'
import { getCurrentUser } from '@/lib/auth'
import { sanitizeMongoInput, sanitizeUser } from '@/lib/sanitize'
import { cacheWithFallback } from '@/lib/redis-cache'

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request)
    const { searchParams } = new URL(request.url)
    
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit')) || 15, 50)
    const community = sanitizeMongoInput(searchParams.get('community'))
    const author = sanitizeMongoInput(searchParams.get('author'))

    // Create a cache key based on query params
    const cacheKey = `feed:${community || 'global'}:${author || 'all'}:${cursor || 'start'}:${limit}`
    
    await connectDB()

    const postsData = await cacheWithFallback(cacheKey, 60, async () => {
      const query = { isDeleted: { $ne: true } }
      
      if (community) {
        query.community = { $regex: new RegExp(`^${community.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }
      
      if (author) {
        query.author = author
      }

      if (cursor) {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8')
        query._id = { $lt: decodedCursor }
      }

      const posts = await Post.find(query)
        .sort({ _id: -1 }) // Cursor-based pagination works best with _id
        .limit(limit + 1) // Fetch one extra to check if there's more
        .select('-likes -__v') // Exclude heavy/unnecessary fields
        .populate('author', 'name username avatar college isVerified verificationType')
        .lean()

      const hasMore = posts.length > limit
      const resultPosts = hasMore ? posts.slice(0, limit) : posts

      // Fetch community details in parallel
      const communityNames = [...new Set(resultPosts.map(p => p.community).filter(Boolean))]
      const communities = await Community.find({ 
        $or: [
          { name: { $in: communityNames } },
          { slug: { $in: communityNames.map(n => n.toLowerCase().replace(/\s+/g, '-')) } }
        ]
      }).select('name slug emoji').lean()

      const communityMap = communities.reduce((acc, c) => {
        acc[c.name.toLowerCase()] = c
        acc[c.slug.toLowerCase()] = c
        return acc
      }, {})

      const processedPosts = resultPosts.map(post => {
        const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false
        const isBookmarked = currentUser && currentUser.bookmarks ? 
          currentUser.bookmarks.some(id => id.toString() === post._id.toString()) : false
        
        const communityInfo = post.community ? communityMap[post.community.toLowerCase()] : null

        const { likes, author: postAuthor, ...postData } = post
        
        return {
          ...postData,
          likesCount: post.likesCount ?? post.likes?.length ?? 0,
          shareCount: post.shareCount ?? 0,
          author: sanitizeUser(postAuthor),
          _isLiked: isLiked,
          _isBookmarked: isBookmarked,
          communityInfo: communityInfo ? {
            name: communityInfo.name,
            slug: communityInfo.slug,
            emoji: communityInfo.emoji
          } : null
        }
      })

      const nextCursor = hasMore 
        ? Buffer.from(resultPosts[resultPosts.length - 1]._id.toString()).toString('base64')
        : null

      return {
        posts: processedPosts,
        pagination: {
          nextCursor,
          hasNextPage: hasMore,
          limit
        }
      }
    })

    return NextResponse.json({
      success: true,
      ...postsData
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'Vary': 'Cookie'
      }
    })
  } catch (error) {
    console.error('Cursor feed error:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Internal Server Error' }
    }, { status: 500 })
  }
}

