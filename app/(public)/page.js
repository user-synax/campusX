import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import HeroClient from '@/components/landing/HeroClient'
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Footer from "@/components/landing/Footer";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Resource from "@/models/Resource";
import StudyRoom from '@/models/StudyRoom';
import { verifyToken } from "@/lib/auth-edge";

export const metadata = {
  title: "CampusX — Social Network for Indian College Students",
  description: "Join your campus community, share posts, access resources, and stay connected with your college mates exclusively on CampusX.",
  keywords: ["student social network", "college community", "IIT", "NIT", "campus", "indian students"],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://campus-x-rho.vercel.app',
    siteName: 'CampusX',
    title: 'CampusX — Social Network for Indian College Students',
    description: 'Join your campus community, share posts, access resources, and stay connected.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'CampusX — Student Social Network'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusX — Social Network for Indian College Students',
    description: 'Join your campus community exclusively on CampusX.',
    images: ['/og-image.png']
  }
};

// Server action or direct DB call for landing page stats
async function getLandingStats() {
  try {
    await connectDB();
    const [users, posts, resources, studyRooms] = await Promise.all([
      User.countDocuments().lean(),
      Post.countDocuments().lean(),
      Resource.countDocuments({ status: 'approved' }).lean(),
      StudyRoom.countDocuments().lean()
    ]);

    return {
      users: users || 0,
      posts: posts || 0,
      resources: resources || 0,
      codeAreas: studyRooms || 0
    };
  } catch (error) {
    console.error('[Landing Stats Fetch Error]:', error);
    return { users: 0, posts: 0, resources: 0, codeAreas: 0 };
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
      <HeroClient />
      <Stats 
        users={stats.users}
        posts={stats.posts}
        resources={stats.resources}
        codeAreas={stats.codeAreas}
      />
      <Features />
      <Footer />
    </main>
  );
}
