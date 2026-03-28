import { ImageResponse } from 'next/og'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import User from '@/models/User'

export const runtime = 'edge'

function formatCollegeName(slug) {
  if (!slug) return 'College'
  return slug
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const collegeSlug = searchParams.get('college') || ''
  const formattedName = formatCollegeName(collegeSlug)

  let postCount = 0
  let memberCount = 0

  try {
    await connectDB()

    const [posts, members] = await Promise.all([
      Post.countDocuments({
        community: { $regex: collegeSlug, $options: 'i' },
        isDeleted: false
      }),
      User.countDocuments({
        college: { $regex: collegeSlug, $options: 'i' }
      })
    ])

    postCount = posts || 0
    memberCount = members || 0
  } catch {
    // Use fallback values (0)
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
        {/* Background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at top right, #1a1a2e 0%, transparent 50%), radial-gradient(ellipse at bottom left, #0d1117 0%, transparent 50%)',
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)',
          backgroundSize: '40px 40px'
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
          height: '100%'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {/* College icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                🎓
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  color: '#71717a',
                  marginBottom: '4px'
                }}>
                  CampusX Community
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#f0f0f0',
                  letterSpacing: '-1px'
                }}>
                  {formattedName}
                </div>
              </div>
            </div>

            {/* Logo */}
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f0f0f0'
            }}>
              CampusX
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Description */}
          <div style={{
            fontSize: '24px',
            color: '#a1a1aa',
            marginBottom: '32px',
            lineHeight: 1.4
          }}>
            Join the {formattedName} community on CampusX. Connect with fellow students, share posts, and stay updated.
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '48px',
            padding: '24px',
            background: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid #2a2a2a'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#f0f0f0',
                lineHeight: 1
              }}>
                {postCount.toLocaleString()}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#71717a',
                textTransform: 'uppercase',
                marginTop: '8px'
              }}>
                Posts
              </span>
            </div>
            <div style={{
              width: '1px',
              background: '#2a2a2a'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#f0f0f0',
                lineHeight: 1
              }}>
                {memberCount.toLocaleString()}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#71717a',
                textTransform: 'uppercase',
                marginTop: '8px'
              }}>
                Members
              </span>
            </div>
            <div style={{
              flex: 1
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6366f1',
              fontSize: '18px',
              fontWeight: 600
            }}>
              Join Community →
            </div>
          </div>

          {/* Bottom accent */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '24px',
            gap: '8px',
            color: '#52525b',
            fontSize: '14px'
          }}>
            campusx.vercel.app/community/{collegeSlug.toLowerCase().replace(/\s+/g, '-')}
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
