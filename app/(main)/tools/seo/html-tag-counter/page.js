"use client";

import { useState, useEffect } from "react";
import { FileCode, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";

export default function HtmlTagCounter() {
    const [html, setHtml] = useState("");
    const [results, setResults] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const analyzeHtml = () => {
        if (!html.trim()) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Count all tags
        const tagCounts = {};
        let totalElements = 0;
        let maxDepth = 0;

        const countTags = (node, depth = 0) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                totalElements++;
                maxDepth = Math.max(maxDepth, depth);

                for (const child of node.childNodes) {
                    countTags(child, depth + 1);
                }
            }
        };

        countTags(doc.body);

        // Extract heading hierarchy
        const headings = [];
        const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
        headingElements.forEach((h) => {
            headings.push({
                tag: h.tagName.toLowerCase(),
                text: h.textContent.trim().substring(0, 50),
            });
        });

        // SEO checks
        const seoChecks = [];
        const h1Count = tagCounts["h1"] || 0;
        const h2Count = tagCounts["h2"] || 0;
        const hasMain = tagCounts["main"] > 0;
        const hasNav = tagCounts["nav"] > 0;
        const hasFooter = tagCounts["footer"] > 0;
        const hasHeader = tagCounts["header"] > 0;

        if (h1Count === 0) {
            seoChecks.push({ type: "error", message: "Missing <h1> tag - every page should have one main heading" });
        } else if (h1Count > 1) {
            seoChecks.push({ type: "warning", message: `Multiple <h1> tags found (${h1Count}) - consider using only one` });
        } else {
            seoChecks.push({ type: "success", message: "Single <h1> tag present - good for SEO" });
        }

        if (h2Count === 0 && h1Count > 0) {
            seoChecks.push({ type: "warning", message: "No <h2> tags found - consider adding subheadings" });
        }

        if (!hasMain) {
            seoChecks.push({ type: "warning", message: "Missing <main> tag - recommended for semantic HTML" });
        } else {
            seoChecks.push({ type: "success", message: "<main> tag present - good for accessibility" });
        }

        if (!hasNav) {
            seoChecks.push({ type: "info", message: "Missing <nav> tag - consider adding for navigation" });
        }

        if (!hasHeader) {
            seoChecks.push({ type: "info", message: "Missing <header> tag - consider adding for page header" });
        }

        if (!hasFooter) {
            seoChecks.push({ type: "info", message: "Missing <footer> tag - consider adding for page footer" });
        }

        // Check heading order
        let headingOrderValid = true;
        let prevLevel = 0;
        for (const h of headings) {
            const level = parseInt(h.tag.charAt(1));
            if (level > prevLevel + 1) {
                headingOrderValid = false;
                break;
            }
            prevLevel = level;
        }

        if (!headingOrderValid && headings.length > 0) {
            seoChecks.push({ type: "warning", message: "Heading hierarchy skips levels (e.g., h1 → h3)" });
        }

        // Sort tags by frequency
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count, percentage: ((count / totalElements) * 100).toFixed(1) }));

        setResults({
            totalElements,
            uniqueTags: Object.keys(tagCounts).length,
            maxDepth,
            tagCounts: sortedTags,
            headings,
            seoChecks,
        });
    };

    if (!mounted) return null;

    return (
        <SeoToolLayout
            title="HTML Tag Counter"
            description="Analyze HTML tag frequency and heading hierarchy for SEO."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileCode className="w-5 h-5 text-muted-foreground" />
                            <h3 className="text-lg font-bold">Paste HTML</h3>
                        </div>
                        <Textarea
                            value={html}
                            onChange={(e) => setHtml(e.target.value)}
                            placeholder="Paste your HTML here..."
                            rows={15}
                            className="font-mono text-sm"
                        />
                        <Button onClick={analyzeHtml} className="w-full">
                            Analyze HTML
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {results && (
                        <>
                            <div className="p-6 rounded-2xl border border-border bg-card">
                                <h3 className="text-lg font-bold mb-4">Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-muted/50">
                                        <div className="text-3xl font-black">{results.totalElements}</div>
                                        <div className="text-xs text-muted-foreground">Total Elements</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-muted/50">
                                        <div className="text-3xl font-black">{results.uniqueTags}</div>
                                        <div className="text-xs text-muted-foreground">Unique Tags</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-muted/50">
                                        <div className="text-3xl font-black">{results.maxDepth}</div>
                                        <div className="text-xs text-muted-foreground">Max Depth</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Tag Frequency</h3>
                                
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {results.tagCounts.map(({ tag, count, percentage }) => (
                                        <div key={tag} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-mono font-medium">&lt;{tag}&gt;</span>
                                                <span className="text-muted-foreground">{count} ({percentage}%)</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Heading Hierarchy</h3>
                                
                                {results.headings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No headings found in the HTML.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                        {results.headings.map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                                                style={{ marginLeft: `${(parseInt(h.tag.charAt(1)) - 1) * 12}px` }}
                                            >
                                                <span className="text-xs font-mono font-bold text-blue-500">
                                                    {h.tag}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {h.text || "[empty]"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">SEO Recommendations</h3>
                                
                                <div className="space-y-2">
                                    {results.seoChecks.map((check, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-start gap-2 p-3 rounded-lg ${
                                                check.type === "error"
                                                    ? "bg-red-500/10"
                                                    : check.type === "warning"
                                                    ? "bg-amber-500/10"
                                                    : check.type === "success"
                                                    ? "bg-green-500/10"
                                                    : "bg-blue-500/10"
                                            }`}
                                        >
                                            {check.type === "error" && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                            {check.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                                            {check.type === "success" && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                                            {check.type === "info" && <FileCode className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                                            <p className="text-xs">{check.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SeoToolLayout>
    );
}
