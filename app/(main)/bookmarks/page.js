
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Lock } from 'lucide-react';
import useUser from '@/hooks/useUser';
import PostCard from '@/components/post/PostCard';
import PostSkeleton from '@/components/post/PostSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function BookmarksPage() {
  const { user: currentUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchBookmarks = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?page=${pageNum}&limit=20`);
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks(1);
  }, [fetchBookmarks]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBookmarks(nextPage);
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(posts.filter(p => p._id !== deletedPostId));
  };

  return (
    <>
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Only visible to you</p>
      </div>

      <div className="mx-4 mt-4 p-3 rounded-lg bg-accent border border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="w-3 h-3" /> Your bookmarks are private. No one else can see this page.
        </p>
      </div>

      <div className="mt-4">
        {loading && posts.length === 0 ? (
          Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <EmptyState 
            icon={Bookmark} 
            title="No saved posts yet" 
            description="Tap the bookmark icon on any post to save it here for later." 
          />
        ) : (
          <>
            {posts.map(post => (
              post && <PostCard key={post._id} post={post} currentUserId={currentUser?._id} onDelete={handlePostDelete} />
            ))}
            {hasMore && (
              <div className="flex justify-center my-4">
                <Button variant="ghost" onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
