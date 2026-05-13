"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Twitter, Facebook, Linkedin, MessageSquare, Send, Pin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";
import { toast } from "sonner";

export default function SocialShareGenerator() {
    const [formData, setFormData] = useState({
        url: "",
        title: "",
        text: "",
        hashtags: "",
        via: "",
    });
    const [mounted, setMounted] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateShareUrls = () => {
        const encodedUrl = encodeURIComponent(formData.url);
        const encodedTitle = encodeURIComponent(formData.title);
        const encodedText = encodeURIComponent(formData.text);
        const encodedHashtags = encodeURIComponent(formData.hashtags);
        const encodedVia = formData.via ? encodeURIComponent(formData.via.replace("@", "")) : "";

        const platforms = [
            {
                id: "twitter",
                name: "Twitter / X",
                icon: <Twitter className="w-5 h-5" />,
                color: "bg-black dark:bg-white text-white dark:text-black",
                url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText || encodedTitle}&hashtags=${formData.hashtags}&via=${encodedVia}`,
            },
            {
                id: "facebook",
                name: "Facebook",
                icon: <Facebook className="w-5 h-5" />,
                color: "bg-blue-600 text-white",
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            },
            {
                id: "linkedin",
                name: "LinkedIn",
                icon: <Linkedin className="w-5 h-5" />,
                color: "bg-blue-700 text-white",
                url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            },
            {
                id: "reddit",
                name: "Reddit",
                icon: <MessageSquare className="w-5 h-5" />,
                color: "bg-orange-600 text-white",
                url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            },
            {
                id: "whatsapp",
                name: "WhatsApp",
                icon: <Send className="w-5 h-5" />,
                color: "bg-green-500 text-white",
                url: `https://wa.me/?text=${encodedText || encodedTitle}%20${encodedUrl}`,
            },
            {
                id: "telegram",
                name: "Telegram",
                icon: <Send className="w-5 h-5" />,
                color: "bg-blue-500 text-white",
                url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText || encodedTitle}`,
            },
            {
                id: "pinterest",
                name: "Pinterest",
                icon: <Pin className="w-5 h-5" />,
                color: "bg-red-600 text-white",
                url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText || encodedTitle}`,
            },
            {
                id: "email",
                name: "Email",
                icon: <Mail className="w-5 h-5" />,
                color: "bg-gray-600 text-white",
                url: `mailto:?subject=${encodedTitle}&body=${encodedText || ""}%0A%0A${encodedUrl}`,
            },
        ];

        return platforms;
    };

    const handleCopy = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success("Share URL copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleOpen = (url) => {
        window.open(url, "_blank");
    };

    if (!mounted) return null;

    const shareUrls = generateShareUrls();

    return (
        <SeoToolLayout
            title="Social Share Link Generator"
            description="Generate share URLs for Twitter, Facebook, LinkedIn, and more."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <h3 className="text-lg font-bold">Share Details</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">URL to Share *</Label>
                            <Input
                                value={formData.url}
                                onChange={(e) => handleChange("url", e.target.value)}
                                placeholder="https://example.com/page"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Share Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="Your page title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Share Text</Label>
                            <Textarea
                                value={formData.text}
                                onChange={(e) => handleChange("text", e.target.value)}
                                placeholder="Custom message or description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Hashtags (comma-separated)</Label>
                            <Input
                                value={formData.hashtags}
                                onChange={(e) => handleChange("hashtags", e.target.value)}
                                placeholder="seo, webdev, tools"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Twitter Via (handle)</Label>
                            <Input
                                value={formData.via}
                                onChange={(e) => handleChange("via", e.target.value)}
                                placeholder="@username"
                            />
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <h3 className="text-lg font-bold">Generated Share URLs</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {shareUrls.map((platform) => (
                                <div
                                    key={platform.id}
                                    className="p-4 rounded-xl border border-border bg-muted/50 space-y-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${platform.color}`}>
                                            {platform.icon}
                                        </div>
                                        <span className="font-medium text-sm">{platform.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleCopy(platform.url, platform.id)}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            {copiedId === platform.id ? (
                                                <span className="text-green-500 text-xs">Copied!</span>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleOpen(platform.url)}
                                            size="sm"
                                            variant="outline"
                                            disabled={!formData.url}
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground truncate">
                                        {platform.url}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!formData.url && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-200/80">
                                Enter a URL to generate share links for all platforms.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </SeoToolLayout>
    );
}
