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

  if (!validateObjectId(postId)) {
    return {
      title: 'Post not found — CampusX',
      description: 'This post may have been deleted.'
    };
  }

  try {
    await connectDB();

    const post = await Post.findById(postId)
      .populate('author', 'name username college')
      .select('content author isAnonymous createdAt')
      .lean();

    if (!post) {
      return {
        title: 'Post not found — CampusX',
        description: 'This post may have been deleted.'
      };
    }

    // Anonymous post — don't reveal author
    const authorText = post.isAnonymous
      ? 'Anonymous on CampusX'
      : `${post.author.name} (@${post.author.username})`;

    // Trim content for description
    const description = post.content.length > 200
      ? post.content.slice(0, 197) + '...'
      : post.content;

    // Clean content for title (first line or first 60 chars)
    const firstLine = post.content.split('\n')[0];
    const title = firstLine.length > 60
      ? firstLine.slice(0, 57) + '...'
      : firstLine;

    // OG image URL — generated dynamically
    const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/post?id=${postId}`;
    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`;

    return {
      title: `${title} — CampusX`,
      description: `${authorText}: ${description}`,
      openGraph: {
        type: 'article',
        title: `${authorText} on CampusX`,
        description,
        url: postUrl,
        siteName: 'CampusX',
        publishedTime: post.createdAt,
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: description
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${authorText} on CampusX`,
        description,
        images: [ogImageUrl]
      }
    };
  } catch (error) {
    return {
      title: 'CampusX',
      description: 'India ka student social network'
    };
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
