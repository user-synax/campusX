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
  title: 'CampusX — Your Campus Community',
  description: 'Connect with students, discover events, join college communities.',
  openGraph: {
    title: 'CampusX',
    description: 'Connect with students, discover events, join college communities.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
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
