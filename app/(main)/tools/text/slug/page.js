"use client";

import { useState, useEffect } from "react";
import { Copy, Link2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function SlugGeneratorTool() {
    const [input, setInput] = useState("");
    const [slug, setSlug] = useState("");
    const [separator, setSeparator] = useState("-");
    const [lowercase, setLowercase] = useState(true);
    const [removeStopWords, setRemoveStopWords] = useState(false);

    const generateSlug = () => {
        if (!input) {
            setSlug("");
            return;
        }

        let text = input.trim();
        
        if (lowercase) {
            text = text.toLowerCase();
        }

        if (removeStopWords) {
            const stopWords = ["a", "an", "the", "and", "or", "but", "is", "if", "then", "else", "when", "at", "from", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once"];
            text = text.split(/\s+/).filter(word => !stopWords.includes(word.toLowerCase())).join(" ");
        }

        // Replace special characters with space
        text = text.replace(/[^\w\s-]/g, "");
        
        // Replace spaces and multiple separators with single separator
        text = text.replace(/[\s_-]+/g, separator);
        
        // Remove leading/trailing separator
        text = text.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), "");

        setSlug(text);
    };

    useEffect(() => {
        generateSlug();
    }, [input, separator, lowercase, removeStopWords]);

    const copyToClipboard = () => {
        if (!slug) return;
        navigator.clipboard.writeText(slug);
        toast.success("Slug copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Slug Generator"
            description="Convert any text into a clean, SEO-friendly, URL-ready slug."
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-2">
                            <Label>Separator</Label>
                            <Input 
                                value={separator} 
                                onChange={(e) => setSeparator(e.target.value.substring(0, 1))} 
                                maxLength={1}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id="lowercase" 
                                    checked={lowercase} 
                                    onCheckedChange={setLowercase}
                                />
                                <Label htmlFor="lowercase" className="cursor-pointer">Force Lowercase</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id="stopwords" 
                                    checked={removeStopWords} 
                                    onCheckedChange={setRemoveStopWords}
                                />
                                <Label htmlFor="stopwords" className="cursor-pointer">Remove Stop Words</Label>
                            </div>
                        </div>

                        <Button onClick={copyToClipboard} className="w-full" disabled={!slug}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Slug
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Input Text</Label>
                        <Textarea
                            placeholder="Enter text to convert (e.g., My Awesome Blog Post!)..."
                            className="min-h-[150px] text-lg"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Generated Slug</Label>
                        <div className="p-6 rounded-2xl border border-border bg-muted/30 font-mono text-xl break-all">
                            {slug || <span className="text-muted-foreground italic">my-awesome-slug</span>}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
