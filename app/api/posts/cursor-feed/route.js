import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50)
  const community = searchParams.get('community')
  const author = searchParams.get('author')

  try {
    const posts = []
    const hasMore = posts.length === limit
    const nextCursor = hasMore && posts.length > 0 
      ? Buffer.from(posts[posts.length - 1]._id.toString()).toString('base64')
      : null

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        cursor: nextCursor,
        limit,
        hasNextPage: hasMore
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: error.message }
    }, { status: 500 })
  }
}
