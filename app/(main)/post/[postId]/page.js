import { notFound } from "next/navigation";
import { Suspense } from "react";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { validateObjectId } from "@/utils/validators";
import PostDetailClient from "@/components/post/PostDetailClient";

// ─── Caching strategy ────────────────────────────────────────────────────────
// Post pages are user-generated and can be deleted or edited at any time.
// We revalidate every 60 s so CDN edges serve a fast cached response while
// staying reasonably fresh. Remove this and use force-dynamic if real-time
// accuracy matters more than edge performance.
export const revalidate = 60;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip markdown-style syntax and collapse whitespace for clean meta text. */
function sanitizeForMeta(text = "") {
    return text
        .replace(/[*_`#>~\[\]]/g, "") // strip markdown characters
        .replace(/\n+/g, " ") // flatten newlines
        .replace(/\s{2,}/g, " ") // collapse runs of spaces
        .trim();
}

/** Truncate a string to maxLen, appending ellipsis only when cut. */
function truncate(text, maxLen) {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1).trimEnd() + "…";
}

/** Derive the first meaningful sentence from content for the OG title. */
function deriveTitle(content = "") {
    const firstLine = sanitizeForMeta(content.split("\n")[0]);
    return truncate(firstLine, 65);
}

/** Extract simple keywords from the post for the <meta name="keywords"> tag. */
function extractKeywords(content = "") {
    const stopwords = new Set([
        "the",
        "a",
        "an",
        "is",
        "it",
        "in",
        "on",
        "at",
        "to",
        "of",
        "and",
        "or",
        "but",
        "for",
        "with",
        "this",
        "that",
        "are",
        "was",
        "were",
        "be",
        "been",
        "have",
        "has",
        "do",
        "does",
        "did",
        "will",
        "just",
        "can",
        "i",
        "my",
        "me",
        "we",
        "you",
        "he",
        "she",
        "they",
        "them",
        "their",
        "its",
        "our",
    ]);
    return [
        ...new Set(
            content
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .split(/\s+/)
                .filter((w) => w.length > 3 && !stopwords.has(w)),
        ),
    ]
        .slice(0, 10)
        .join(", ");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
    const { postId } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campuszen.in";
    const ogImage = `${baseUrl}/og-image.png`;

    // Invalid ID — return minimal non-indexable metadata
    if (!validateObjectId(postId)) {
        return {
            title: "Post not found — CampusZen",
            description: "This post may have been deleted or never existed.",
            robots: { index: false, follow: false },
        };
    }

    try {
        await connectDB();

        const post = await Post.findById(postId)
            .populate("author", "name username")
            .select("content author isAnonymous createdAt community tags")
            .lean();

        if (!post) {
            return {
                title: "Post not found — CampusZen",
                description: "This post may have been deleted.",
                robots: { index: false, follow: false },
            };
        }

        const isAnon = post.isAnonymous;
        const authorName = isAnon ? "Anonymous" : post.author?.name;
        const authorHandle = isAnon ? null : post.author?.username;
        const postUrl = `${baseUrl}/post/${postId}`;

        const cleanContent = sanitizeForMeta(post.content);
        const title = deriveTitle(post.content);
        const description = truncate(cleanContent, 200);
        const keywords = extractKeywords(post.content);

        // Construct a human-readable byline for OG — e.g. "Arjun Mehta on CampusZen"
        const byline = isAnon
            ? `Anonymous on CampusZen`
            : `${authorName} on CampusZen`;

        return {
            // ── Basic ──────────────────────────────────────────────────────
            title: `${title} — CampusZen`,
            description: `${byline}: ${description}`,
            keywords,

            // ── Canonical ─────────────────────────────────────────────────
            alternates: {
                canonical: postUrl,
            },

            // ── Robots ────────────────────────────────────────────────────
            // Don't let search engines index anonymous posts to protect privacy.
            robots: isAnon
                ? { index: false, follow: true }
                : { index: true, follow: true, "max-snippet": 200 },

            // ── Open Graph ────────────────────────────────────────────────
            openGraph: {
                type: "article",
                url: postUrl,
                siteName: "CampusZen",
                title: `${byline}: ${title}`,
                description,
                publishedTime: post.createdAt?.toISOString?.() ?? undefined,
                // Only expose real author to OG; anonymous stays private.
                ...(authorHandle && {
                    authors: [`${baseUrl}/u/${authorHandle}`],
                }),
                ...(post.community && { section: post.community }),
                ...(post.tags?.length && { tags: post.tags }),
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: `${title} — CampusZen`,
                        type: "image/png",
                    },
                ],
            },

            // ── Twitter / X Card ──────────────────────────────────────────
            twitter: {
                card: "summary_large_image",
                site: "@campuszen",
                title: `${byline}: ${title}`,
                description,
                images: [ogImage],
            },
        };
    } catch (_err) {
        // DB error — return a safe fallback; don't leak internal details.
        return {
            title: "CampusZen",
            description: "India's student social network",
            robots: { index: false, follow: false },
        };
    }
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────
// Injected as a server-rendered <script> — zero JS bundle cost.
// Google uses Article schema for rich results in Search.

async function PostStructuredData({ postId }) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campuszen.in";

    try {
        await connectDB();
        const post = await Post.findById(postId)
            .populate("author", "name username")
            .select("content author isAnonymous createdAt updatedAt")
            .lean();

        if (!post || post.isAnonymous) return null;

        const schema = {
            "@context": "https://schema.org",
            "@type": "SocialMediaPosting",
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${baseUrl}/post/${postId}`,
            },
            headline: truncate(
                sanitizeForMeta(post.content.split("\n")[0]),
                110,
            ),
            description: truncate(sanitizeForMeta(post.content), 200),
            datePublished: post.createdAt?.toISOString?.(),
            dateModified: (post.updatedAt ?? post.createdAt)?.toISOString?.(),
            author: {
                "@type": "Person",
                name: post.author?.name,
                url: `${baseUrl}/u/${post.author?.username}`,
            },
            publisher: {
                "@type": "Organization",
                name: "CampusZen",
                url: baseUrl,
                logo: {
                    "@type": "ImageObject",
                    url: `${baseUrl}/logo.png`,
                },
            },
        };

        return (
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        );
    } catch {
        return null;
    }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
// Renders instantly from the server — prevents layout shift while the client
// component hydrates. Matches the visual structure of PostDetailClient.

function PostDetailSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Back nav */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/60 animate-pulse" />
                <div className="w-20 h-4 rounded-md bg-accent/60 animate-pulse" />
            </div>

            <div className="w-full max-w-2xl mx-auto px-4 py-5 space-y-4">
                {/* Author row */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/60 animate-pulse shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="w-32 h-3.5 rounded-md bg-accent/60 animate-pulse" />
                        <div className="w-20 h-3 rounded-md bg-accent/40 animate-pulse" />
                    </div>
                    <div className="w-16 h-7 rounded-full bg-accent/40 animate-pulse" />
                </div>

                {/* Post body */}
                <div className="space-y-2 pt-1">
                    <div className="w-full h-4 rounded-md bg-accent/60 animate-pulse" />
                    <div className="w-[92%] h-4 rounded-md bg-accent/60 animate-pulse" />
                    <div className="w-[78%] h-4 rounded-md bg-accent/60 animate-pulse" />
                    <div className="w-[85%] h-4 rounded-md bg-accent/50 animate-pulse" />
                    <div className="w-[60%] h-4 rounded-md bg-accent/40 animate-pulse" />
                </div>

                {/* Image placeholder */}
                <div className="w-full h-48 sm:h-56 rounded-2xl bg-accent/40 animate-pulse" />

                {/* Action bar */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-16 h-8 rounded-full bg-accent/50 animate-pulse"
                        />
                    ))}
                </div>

                {/* Comment composer */}
                <div className="flex gap-3 items-center pt-2">
                    <div className="w-8 h-8 rounded-full bg-accent/60 animate-pulse shrink-0" />
                    <div className="flex-1 h-10 rounded-2xl bg-accent/50 animate-pulse" />
                </div>

                {/* Comments */}
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="flex gap-3 pt-3 border-t border-border/30"
                    >
                        <div className="w-8 h-8 rounded-full bg-accent/50 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="w-24 h-3 rounded-md bg-accent/50 animate-pulse" />
                            <div className="w-full h-3 rounded-md bg-accent/40 animate-pulse" />
                            <div className="w-3/4 h-3 rounded-md bg-accent/30 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PostPage({ params }) {
    const { postId } = await params;

    if (!validateObjectId(postId)) {
        notFound();
    }

    return (
        <>
            {/* JSON-LD — server-rendered, zero bundle cost */}
            <PostStructuredData postId={postId} />

            {/*
             * Suspense boundary: PostDetailSkeleton streams to the browser
             * instantly (no FOUC), then PostDetailClient hydrates into it.
             * This gives us SSR-fast perceived load + full interactivity.
             */}
            <Suspense fallback={<PostDetailSkeleton />}>
                <PostDetailClient postId={postId} />
            </Suspense>
        </>
    );
}
