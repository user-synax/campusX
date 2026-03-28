import { notFound } from 'next/navigation'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { formatCollegeName } from '@/utils/formatters'

export async function generateMetadata({ params }) {
  const { username } = await params

  try {
    await connectDB()

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('name username bio college isVerified followers')
      .lean()

    if (!user) {
      return { title: 'User not found — CampusX' }
    }

    const description = user.bio
      ? `${user.bio} · ${user.followers?.length || 0} followers`
      : `${user.college || 'Student'} on CampusX · ${user.followers?.length || 0} followers`

    const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/profile?username=${username}`
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${username}`

    return {
      title: `${user.name} (@${user.username}) — CampusX`,
      description,
      openGraph: {
        type: 'profile',
        firstName: user.name.split(' ')[0],
        username: user.username,
        title: `${user.name} on CampusX`,
        description,
        url: profileUrl,
        siteName: 'CampusX',
        images: [{ url: ogImage, width: 1200, height: 630 }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${user.name} (@${user.username})`,
        description,
        images: [ogImage]
      }
    }
  } catch (error) {
    console.error('[Profile Metadata] Error:', error)
    return { title: 'CampusX Profile' }
  }
}
