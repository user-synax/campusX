import connectDB from '@/lib/db'
import Post from '@/models/Post'
import User from '@/models/User'
import { formatCollegeName } from '@/utils/formatters'

export async function generateMetadata({ params }) {
  const collegeSlug = decodeURIComponent(params.college)
  const formattedName = formatCollegeName(collegeSlug)

  try {
    await connectDB()

    const [postCount, memberCount] = await Promise.all([
      Post.countDocuments({
        community: { $regex: collegeSlug, $options: 'i' },
        isDeleted: false
      }).catch(() => 0),
      User.countDocuments({
        college: { $regex: collegeSlug, $options: 'i' }
      }).catch(() => 0)
    ])

    const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/community?college=${encodeURIComponent(collegeSlug)}`
    const communityUrl = `${process.env.NEXT_PUBLIC_APP_URL}/community/${collegeSlug}`

    return {
      title: `${formattedName} Community — CampusX`,
      description: `${postCount} posts from ${formattedName} students on CampusX. Join the community!`,
      keywords: ['college community', formattedName, 'campus', 'students'],
      openGraph: {
        type: 'website',
        title: `${formattedName} on CampusX`,
        description: `Join ${formattedName} community — ${postCount} posts and ${memberCount} members.`,
        url: communityUrl,
        siteName: 'CampusX',
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${formattedName} Community`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${formattedName} Community — CampusX`,
        description: `${postCount} posts from ${formattedName} students.`,
        images: [ogImage]
      }
    }
  } catch (error) {
    console.error('[Community Metadata] Error:', error)
    return {
      title: `${formattedName} Community — CampusX`,
      description: `Join the ${formattedName} community on CampusX.`
    }
  }
}
