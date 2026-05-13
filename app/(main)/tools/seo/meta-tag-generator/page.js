"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SeoToolLayout from "@/components/tools/SeoToolLayout";
import { toast } from "sonner";

export default function MetaTagGenerator() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        keywords: "",
        canonicalUrl: "",
        robotsIndex: "index",
        robotsFollow: "follow",
        author: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        ogType: "website",
        twitterCard: "summary_large_image",
        twitterSite: "",
    });
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateMetaTags = () => {
        const tags = [];
        
        if (formData.title) tags.push(`    <title>${formData.title}</title>`);
        if (formData.description) tags.push(`    <meta name="description" content="${formData.description}">`);
        if (formData.keywords) tags.push(`    <meta name="keywords" content="${formData.keywords}">`);
        if (formData.canonicalUrl) tags.push(`    <link rel="canonical" href="${formData.canonicalUrl}">`);
        tags.push(`    <meta name="robots" content="${formData.robotsIndex},${formData.robotsFollow}">`);
        if (formData.author) tags.push(`    <meta name="author" content="${formData.author}">`);
        
        // Open Graph
        tags.push(`    <meta property="og:title" content="${formData.ogTitle || formData.title}">`);
        tags.push(`    <meta property="og:description" content="${formData.ogDescription || formData.description}">`);
        if (formData.ogImage) tags.push(`    <meta property="og:image" content="${formData.ogImage}">`);
        tags.push(`    <meta property="og:type" content="${formData.ogType}">`);
        if (formData.canonicalUrl) tags.push(`    <meta property="og:url" content="${formData.canonicalUrl}">`);
        
        // Twitter Card
        tags.push(`    <meta name="twitter:card" content="${formData.twitterCard}">`);
        if (formData.twitterSite) tags.push(`    <meta name="twitter:site" content="${formData.twitterSite}">`);
        tags.push(`    <meta name="twitter:title" content="${formData.ogTitle || formData.title}">`);
        tags.push(`    <meta name="twitter:description" content="${formData.ogDescription || formData.description}">`);
        if (formData.ogImage) tags.push(`    <meta name="twitter:image" content="${formData.ogImage}">`);
        
        return `<head>\n${tags.join("\n")}\n</head>`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateMetaTags());
        setCopied(true);
        toast.success("Meta tags copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!mounted) return null;

    const titleLength = formData.title.length;
    const descLength = formData.description.length;
    const titleWarning = titleLength > 60;
    const descWarning = descLength > 160;

    return (
        <SeoToolLayout
            title="Meta Tag Generator"
            description="Generate complete SEO meta tags with Open Graph and Twitter Card support."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Form Inputs */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <h3 className="text-lg font-bold">Basic Meta Tags</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Page Title {titleLength > 0 && `(${titleLength}/60)`}
                            </Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="Your page title"
                                className={titleWarning ? "border-red-500" : ""}
                            />
                            {titleWarning && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Title exceeds 60 characters (may be truncated)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Meta Description {descLength > 0 && `(${descLength}/160)`}
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="A brief description of your page"
                                rows={3}
                                className={descWarning ? "border-red-500" : ""}
                            />
                            {descWarning && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Description exceeds 160 characters (may be truncated)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Keywords</Label>
                            <Input
                                value={formData.keywords}
                                onChange={(e) => handleChange("keywords", e.target.value)}
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Canonical URL</Label>
                            <Input
                                value={formData.canonicalUrl}
                                onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                                placeholder="https://example.com/page"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Robots Index</Label>
                                <Select value={formData.robotsIndex} onValueChange={(v) => handleChange("robotsIndex", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="index">index</SelectItem>
                                        <SelectItem value="noindex">noindex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Robots Follow</Label>
                                <Select value={formData.robotsFollow} onValueChange={(v) => handleChange("robotsFollow", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="follow">follow</SelectItem>
                                        <SelectItem value="nofollow">nofollow</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Author</Label>
                            <Input
                                value={formData.author}
                                onChange={(e) => handleChange("author", e.target.value)}
                                placeholder="Author name"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <h3 className="text-lg font-bold">Open Graph Tags</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">OG Title</Label>
                            <Input
                                value={formData.ogTitle}
                                onChange={(e) => handleChange("ogTitle", e.target.value)}
                                placeholder="Leave empty to use page title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">OG Description</Label>
                            <Textarea
                                value={formData.ogDescription}
                                onChange={(e) => handleChange("ogDescription", e.target.value)}
                                placeholder="Leave empty to use meta description"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">OG Image URL</Label>
                            <Input
                                value={formData.ogImage}
                                onChange={(e) => handleChange("ogImage", e.target.value)}
                                placeholder="https://example.com/og-image.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">OG Type</Label>
                            <Select value={formData.ogType} onValueChange={(v) => handleChange("ogType", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="website">website</SelectItem>
                                    <SelectItem value="article">article</SelectItem>
                                    <SelectItem value="video">video</SelectItem>
                                    <SelectItem value="image">image</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <h3 className="text-lg font-bold">Twitter Card Tags</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Card Type</Label>
                            <Select value={formData.twitterCard} onValueChange={(v) => handleChange("twitterCard", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="summary">summary</SelectItem>
                                    <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                                    <SelectItem value="app">app</SelectItem>
                                    <SelectItem value="player">player</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Twitter Site Handle</Label>
                            <Input
                                value={formData.twitterSite}
                                onChange={(e) => handleChange("twitterSite", e.target.value)}
                                placeholder="@username"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Generated Meta Tags</h3>
                            <Button onClick={handleCopy} size="sm" variant="outline">
                                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-xl overflow-x-auto text-sm font-mono">
                            <code>{generateMetaTags()}</code>
                        </pre>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <h3 className="text-lg font-bold">Google SERP Preview</h3>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-border">
                            <div className="space-y-1">
                                <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
                                    {formData.title || "Your Page Title"}
                                </p>
                                <p className="text-green-700 dark:text-green-500 text-sm truncate">
                                    {formData.canonicalUrl || "https://example.com/page"}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {formData.description || "A brief description of your page will appear here in search results."}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className={titleLength > 60 ? "text-red-500" : "text-green-500"}>
                                Title: {titleLength}/60 chars
                            </span>
                            <span className={descLength > 160 ? "text-red-500" : "text-green-500"}>
                                Description: {descLength}/160 chars
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </SeoToolLayout>
    );
}
