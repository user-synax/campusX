"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Search, X, TrendingUp, Smile, Zap, Trophy, Sticker, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'reactions', label: 'Reactions', icon: Smile },
  { id: 'entertainment', label: 'Entertainment', icon: Zap },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'stickers', label: 'Stickers', icon: Sticker },
];

export default function GifPicker({ onSelect, trigger }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [previewGif, setPreviewGif] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch GIFs based on search or category
  const fetchGifs = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    const newOffset = reset ? 0 : offset;

    try {
      let url;
      if (debouncedSearch.trim()) {
        url = `/api/giphy/search?q=${encodeURIComponent(debouncedSearch)}&offset=${newOffset}&limit=20`;
      } else {
        url = `/api/giphy/trending?offset=${newOffset}&limit=20`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch GIFs');

      const data = await res.json();
      
      if (reset) {
        setGifs(data.gifs);
      } else {
        setGifs(prev => [...prev, ...data.gifs]);
      }

      setHasMore(data.gifs.length === 20);
      setOffset(newOffset + 20);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, offset, loading]);

  // Initial load and search
  useEffect(() => {
    if (open) {
      setOffset(0);
      fetchGifs(true);
    }
  }, [open, debouncedSearch]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
      fetchGifs();
    }
  }, [hasMore, loading, fetchGifs]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(categoryId === 'trending' ? '' : categoryId);
    setOffset(0);
    setGifs([]);
  };

  const handleGifSelect = (gif) => {
    setPreviewGif(gif);
  };

  const handleConfirmSelect = async () => {
    if (previewGif) {
      onSelect({
        url: previewGif.url,
        title: previewGif.title,
        width: previewGif.width,
        height: previewGif.height,
        previewUrl: previewGif.previewUrl,
        id: previewGif.id
      });
      
      setPreviewGif(null);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewGif(null);
    setSearchQuery("");
    setGifs([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <span className="text-lg">GIF</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border max-h-[85vh] h-auto sm:h-[550px] flex flex-col">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Choose a GIF
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="px-4 pb-2">
            <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <cat.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* GIF Grid */}
        <div 
          ref={scrollRef}
          className="flex-1 px-4 overflow-y-auto max-h-[50vh] sm:max-h-[320px]"
          onScroll={handleScroll}
        >
          {gifs.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No GIFs found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleGifSelect(gif)}
                  className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
                >
                  <Image
                    src={gif.previewUrl}
                    alt={gif.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 300px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
              
              {loading && (
                <div className="col-span-2 flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Dialog */}
        {previewGif && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={previewGif.url}
                alt={previewGif.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {previewGif.title}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewGif(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSelect}>
                Add GIF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
