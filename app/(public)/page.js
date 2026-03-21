import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Footer from "@/components/landing/Footer";

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

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campusx_token");

  if (token) {
    redirect("/feed");
  }

  // ISR — revalidate every 60 seconds
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const res = await fetch(
    `${baseUrl}/api/public/stats`,
    { next: { revalidate: 60 } }
  ).catch((err) => {
    console.error('Stats fetch error:', err);
    return null;
  });

  const data = res?.ok ? await res.json() : null;
  const stats = {
    users: data?.users || 0,
    posts: data?.posts || 0,
    communities: data?.communities || 0
  };

  return (
    <main>
      <Hero />
      <Stats users={stats.users} posts={stats.posts} communities={stats.communities} />
      <Features />
      <Footer />
    </main>
  );
}
