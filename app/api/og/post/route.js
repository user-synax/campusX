import { ImageResponse } from 'next/og'
import connectDB from '@/lib/db'
import Post from '@/models/Post'

export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('id')

  let postContent = 'Check out this post on CampusX'
  let authorName = 'CampusX User'
  let authorUsername = ''
  let college = ''
  let isAnonymous = false

  try {
    await connectDB()
    const post = await Post.findById(postId)
      .populate('author', 'name username college')
      .select('content author isAnonymous')
      .lean()

    if (post) {
      isAnonymous = post.isAnonymous
      postContent = post.content.length > 280
        ? post.content.slice(0, 277) + '...'
        : post.content

      if (!post.isAnonymous && post.author) {
        authorName = post.author.name
        authorUsername = post.author.username
        college = post.author.college || ''
      } else {
        authorName = 'Anonymous'
      }
    }
  } catch {
    // Fallback values already set
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at top left, #1a1a2e 0%, transparent 50%), radial-gradient(ellipse at bottom right, #0d1117 0%, transparent 50%)',
        }} />

        {/* Border */}
        <div style={{
          position: 'absolute',
          top: '20px', left: '20px', right: '20px', bottom: '20px',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between'
        }}>

          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#f0f0f0',
              letterSpacing: '-1px'
            }}>
              CampusX
            </div>
            {college && (
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '999px',
                padding: '4px 14px',
                fontSize: '14px',
                color: '#888'
              }}>
                🎓 {college}
              </div>
            )}
          </div>

          {/* Post content */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '20px 0'
          }}>
            <p style={{
              fontSize: postContent.length > 150 ? '28px' : '36px',
              color: '#f0f0f0',
              lineHeight: 1.4,
              fontWeight: 500,
              margin: 0,
              maxWidth: '100%'
            }}>
              "{postContent}"
            </p>
          </div>

          {/* Author */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#1a1a1a',
                border: '2px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#f0f0f0',
                fontWeight: 700
              }}>
                {isAnonymous ? '?' : authorName.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '18px' }}>
                  {authorName}
                </span>
                {authorUsername && (
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    @{authorUsername}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              background: '#1a1a1a',
              border: '1px solid #f0f0f020',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#f0f0f060',
              fontSize: '14px'
            }}>
              campusx.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    }
  )
}
