import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import AnonymousPost from '@/models/AnonymousPost'
import { findPostById } from '@/lib/post-utils'
import { getCurrentUser } from '@/lib/auth'
import { sanitizeMongoInput } from '@/lib/sanitize'
import { validateObjectId } from '@/utils/validators'
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils'
import { attachEquippedToItems } from '@/lib/equipped-helpers'
import { sanitizeUser } from '@/lib/sanitize'

export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request)
    const { postId } = await params

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 })
    }

    await connectDB()

    const { post, model: PostModel } = await findPostById(postId)
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    let populatedPost = post
    if (PostModel === Post) {
      populatedPost = await Post.findById(postId)
        .populate('author', 'name username avatar college')
        .lean()
    } else {
      populatedPost = post.toObject ? post.toObject() : post
    }

    const summary = computeReactionSummary(populatedPost.reactions, populatedPost.likes)
    const userReaction = currentUser ? getUserReaction(populatedPost.reactions, currentUser._id, populatedPost.likes) : null
    const isLiked = currentUser ? populatedPost.likes?.some(id => id.toString() === currentUser._id.toString()) : false

    const { reactions, likes, author, ...postData } = populatedPost
    
    const postResponse = {
      ...postData,
      likesCount: populatedPost.likesCount ?? populatedPost.likes?.length ?? 0,
      shareCount: populatedPost.shareCount ?? 0,
      author: author ? sanitizeUser(author) : null,
      _reactionSummary: summary,
      _userReaction: userReaction,
      _isLiked: isLiked
    }

    const [postWithEquipped] = await attachEquippedToItems([postResponse])

    return NextResponse.json(postWithEquipped)
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 })
    }

    const sanitizedContent = sanitizeMongoInput(content.trim())

    if (sanitizedContent.length > 2000) {
      return NextResponse.json({ message: 'Content exceeds 2000 characters' }, { status: 400 })
    }

    const post = await Post.findById(postId)

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    if (post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to edit this post' }, { status: 403 })
    }

    post.content = sanitizedContent
    await post.save()

    return NextResponse.json({ 
      message: 'Post updated successfully',
      post: {
        _id: post._id,
        content: post.content,
        updatedAt: post.updatedAt
      }
    })
  } catch (error) {
    console.error('[EditPostPATCH] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 })
    }

    const post = await Post.findById(postId)

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    if (post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to delete this post' }, { status: 403 })
    }

    await Post.findByIdAndDelete(postId)

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('[DeletePostDELETE] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}