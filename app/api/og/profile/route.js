import { ImageResponse } from 'next/og'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  let name = 'CampusX User'
  let userUsername = ''
  let bio = ''
  let college = ''
  let followersCount = 0
  let postsCount = 0
  let isVerified = false
  let avatarUrl = ''

  try {
    await connectDB()

    const user = await User.findOne({ username: username?.toLowerCase() })
      .select('name username bio college isVerified followers')
      .lean()

    if (user) {
      name = user.name
      userUsername = user.username
      bio = user.bio || ''
      college = user.college || ''
      isVerified = user.isVerified || false
      avatarUrl = user.avatar || ''
      followersCount = user.followers?.length || 0

      const posts = await Post.countDocuments({ author: user._id, isDeleted: false })
      postsCount = posts
    }
  } catch {
    // Use fallback values
  }

  const displayBio = bio.length > 120 ? bio.slice(0, 117) + '...' : bio

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f0f0f',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 30% 50%, #1a1a2e 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #0d1117 0%, transparent 50%)',
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
          width: '100%',
          height: '100%',
          padding: '60px',
          gap: '48px'
        }}>
          {/* Left: Avatar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '280px',
            flexShrink: 0
          }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                width={200}
                height={200}
                style={{
                  borderRadius: '50%',
                  border: '4px solid #2a2a2a',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: '4px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                fontWeight: 700,
                color: 'white'
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Verified badge */}
            {isVerified && (
              <div style={{
                marginTop: '16px',
                background: '#6366f1',
                borderRadius: '999px',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}>
                ✓ Verified
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            minWidth: 0
          }}>
            {/* Name */}
            <div style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#f0f0f0',
              letterSpacing: '-2px',
              lineHeight: 1.1,
              marginBottom: '8px'
            }}>
              {name}
            </div>

            {/* Username */}
            <div style={{
              fontSize: '24px',
              color: '#71717a',
              marginBottom: '20px'
            }}>
              @{userUsername}
            </div>

            {/* Bio */}
            {displayBio && (
              <div style={{
                fontSize: '22px',
                color: '#a1a1aa',
                lineHeight: 1.5,
                marginBottom: '24px',
                maxHeight: '100px',
                overflow: 'hidden'
              }}>
                {displayBio}
              </div>
            )}

            {/* College badge */}
            {college && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '16px',
                color: '#888',
                marginBottom: '24px',
                width: 'fit-content'
              }}>
                🎓 {college}
              </div>
            )}

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '32px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: '#f0f0f0' }}>
                  {followersCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '14px', color: '#71717a', textTransform: 'uppercase' }}>
                  Followers
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: '#f0f0f0' }}>
                  {postsCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '14px', color: '#71717a', textTransform: 'uppercase' }}>
                  Posts
                </span>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#71717a'
          }}>
            CampusX
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
