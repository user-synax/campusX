import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Footer from "@/components/landing/Footer";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Resource from "@/models/Resource";
import { verifyToken } from "@/lib/auth-edge";

export const metadata = {
  title: 'CampusX — India ka Student Social Network',
  description: 'Posts, chats, notes, events — sab ek jagah. Sirf apne college waalon ke saath.',
  keywords: ['student social network', 'college community', 'IIT', 'NIT', 'campus'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'CampusX',
    title: 'CampusX — India ka Student Social Network',
    description: 'Posts, chats, notes, events — sab ek jagah.',
    images: [{
      url: '/og/default.png',
      width: 1200,
      height: 630,
      alt: 'CampusX — Student Social Network'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusX — India ka Student Social Network',
    description: 'Posts, chats, notes, events — sab ek jagah.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og/default.png`]
  }
};

// Server action or direct DB call for landing page stats
async function getLandingStats() {
  try {
    await connectDB();
    const [users, posts, resources, colleges] = await Promise.all([
      User.countDocuments().lean(),
      Post.countDocuments().lean(),
      Resource.countDocuments({ status: 'approved' }).lean(),
      User.distinct('college').lean()
    ]);

    return {
      users: users || 0,
      posts: posts || 0,
      resources: resources || 0,
      communities: colleges.filter(c => c && c.trim() !== '').length || 0
    };
  } catch (error) {
    console.error('[Landing Stats Fetch Error]:', error);
    return { users: 0, posts: 0, resources: 0, communities: 0 };
  }
}

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campusx_token")?.value;

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      redirect("/feed");
    }
  }

  // Get real data directly from DB (fastest for SSR)
  const stats = await getLandingStats();

  return (
    <main>
      <Hero />
      <Stats 
        users={stats.users} 
        posts={stats.posts} 
        resources={stats.resources} 
        communities={stats.communities} 
      />
      <Features />
      <Footer />
    </main>
  );
}
