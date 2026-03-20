import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { validateObjectId } from "@/utils/validators";
import PostDetailClient from "@/components/post/PostDetailClient";

/**
 * Generate dynamic metadata for SEO and OG tags.
 */
export async function generateMetadata({ params }) {
  const { postId } = await params;

  if (!validateObjectId(postId)) return { title: 'Post Not Found' };

  try {
    await connectDB();
    const post = await Post.findById(postId).populate('author', 'name username').lean();

    if (!post) return { title: 'Post Not Found' };

    const title = post.isAnonymous 
      ? `Anonymous Post on CampusX` 
      : `${post.author.name} (@${post.author.username}) on CampusX`;
    
    const description = post.content?.slice(0, 160) || 'View this post on CampusX';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.createdAt,
        authors: [post.isAnonymous ? 'Anonymous' : post.author.name],
        images: post.image ? [post.image] : ['/og-image.png'], // Fallback to default OG image
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.image ? [post.image] : ['/og-image.png'],
      },
    };
  } catch (error) {
    return { title: 'CampusX Post' };
  }
}

/**
 * Post Detail Page (Server Component)
 */
export default async function PostPage({ params }) {
  const { postId } = await params;

  if (!validateObjectId(postId)) {
    notFound();
  }

  return <PostDetailClient postId={postId} />;
}
