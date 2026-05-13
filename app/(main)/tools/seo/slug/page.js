"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle2, AlertCircle, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";
import { toast } from "sonner";

const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "from", "up", "about", "into", "through", "during", "before", "after", "above", "below",
    "between", "under", "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "should",
    "now", "as", "if", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "but", "at", "by", "for", "in", "of", "on", "to", "with"
]);

export default function SeoSlugGenerator() {
    const [input, setInput] = useState("");
    const [slug, setSlug] = useState("");
    const [baseUrl, setBaseUrl] = useState("https://example.com/");
    const [removedWords, setRemovedWords] = useState([]);
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const generateSlug = (text) => {
        if (!text.trim()) return "";

        // Transliterate accented characters
        const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Convert to lowercase and split into words
        const words = normalized.toLowerCase().split(/[^a-z0-9]+/);
        
        // Filter out stop words and empty strings
        const filtered = words.filter(word => word.length > 0 && !STOP_WORDS.has(word));
        const removed = words.filter(word => word.length > 0 && STOP_WORDS.has(word));
        
        setRemovedWords(removed);
        
        // Join with hyphens
        return filtered.join("-");
    };

    useEffect(() => {
        setSlug(generateSlug(input));
    }, [input]);

    const handleCopy = () => {
        navigator.clipboard.writeText(slug);
        setCopied(true);
        toast.success("Slug copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const slugLength = slug.length;
    const slugWarning = slugLength > 60;
    const wordCount = slug.split("-").filter(w => w.length > 0).length;

    if (!mounted) return null;

    return (
        <SeoToolLayout
            title="SEO Slug Generator"
            description="SEO-optimized slug generator with Google preview and keyword analysis."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <h3 className="text-lg font-bold">Input</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Title or Text</Label>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter your page title or text to generate a slug..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Base URL</Label>
                            <Input
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder="https://example.com/"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Generated Slug</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={slug}
                                    readOnly
                                    className="font-mono"
                                    placeholder="your-generated-slug"
                                />
                                <Button onClick={handleCopy} variant="outline" disabled={!slug}>
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            {slugWarning && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Slug exceeds 60 characters (may be truncated in search results)
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50 text-center">
                                <div className="text-2xl font-black">{slugLength}</div>
                                <div className="text-xs text-muted-foreground">Characters</div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 text-center">
                                <div className="text-2xl font-black">{wordCount}</div>
                                <div className="text-xs text-muted-foreground">Words</div>
                            </div>
                        </div>

                        {removedWords.length > 0 && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-amber-200/80 mb-2">
                                    <strong>Removed stop words:</strong>
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {removedWords.map((word, i) => (
                                        <span key={i} className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-500">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <h3 className="text-lg font-bold">Google SERP Preview</h3>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-border space-y-2">
                            <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
                                {input || "Your Page Title"}
                            </p>
                            <p className="text-green-700 dark:text-green-500 text-sm truncate">
                                {baseUrl}{slug}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                A meta description would appear here. This is how your page might look in Google search results.
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className={slugLength > 60 ? "text-red-500" : "text-green-500"}>
                                URL length: {slugLength}/60 chars
                            </span>
                            <span className={slugLength <= 60 ? "text-green-500" : "text-amber-500"}>
                                {slugLength <= 60 ? "✓ Good length for SEO" : "⚠ Consider shortening"}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <h3 className="text-lg font-bold">Full URL Preview</h3>
                        
                        <div className="p-4 rounded-xl bg-muted/50">
                            <p className="text-sm font-mono break-all text-blue-500">
                                {baseUrl}{slug}
                            </p>
                        </div>

                        <Button
                            onClick={() => window.open(`${baseUrl}${slug}`, "_blank")}
                            variant="outline"
                            className="w-full"
                            disabled={!slug}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open URL
                        </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-200/80 leading-relaxed">
                            <strong>SEO Tips:</strong> Keep URLs under 60 characters, use hyphens to separate words, include relevant keywords, and avoid stop words. Accented characters are automatically converted (é→e, ñ→n).
                        </p>
                    </div>
                </div>
            </div>
        </SeoToolLayout>
    );
}
