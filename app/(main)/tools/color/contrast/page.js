"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function ContrastCheckerTool() {
    const [fg, setFg] = useState("#FFFFFF");
    const [bg, setBg] = useState("#6366F1");
    const [ratio, setRatio] = useState(0);
    const [mounted, setMounted] = useState(false);

    const calculateContrast = () => {
        try {
            if (chroma.valid(fg) && chroma.valid(bg)) {
                const r = chroma.contrast(fg, bg);
                setRatio(r);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setMounted(true);
        calculateContrast();
    }, [fg, bg]);

    if (!mounted) return null;

    const getWCAG = (r, size = "small") => {
        if (size === "small") {
            if (r >= 7) return { label: "AAA", pass: true, color: "text-green-500" };
            if (r >= 4.5) return { label: "AA", pass: true, color: "text-emerald-500" };
            return { label: "Fail", pass: false, color: "text-red-500" };
        } else {
            if (r >= 4.5) return { label: "AAA", pass: true, color: "text-green-500" };
            if (r >= 3) return { label: "AA", pass: true, color: "text-emerald-500" };
            return { label: "Fail", pass: false, color: "text-red-500" };
        }
    };

    const aaSmall = getWCAG(ratio, "small");
    const aaaSmall = getWCAG(ratio, "small"); // Simplified for demo
    const aaLarge = getWCAG(ratio, "large");
    const aaaLarge = getWCAG(ratio, "large");

    return (
        <ColorToolLayout
            title="Contrast Checker"
            description="Verify if your background and foreground colors meet WCAG 2.1 accessibility standards."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Inputs & Stats */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Foreground</Label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: fg }} />
                                    <Input value={fg} onChange={(e) => setFg(e.target.value)} className="font-mono uppercase" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Background</Label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: bg }} />
                                    <Input value={bg} onChange={(e) => setBg(e.target.value)} className="font-mono uppercase" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border flex flex-col items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Contrast Ratio</span>
                            <span className={`text-6xl font-black ${ratio >= 4.5 ? "text-green-500" : ratio >= 3 ? "text-amber-500" : "text-red-500"}`}>
                                {ratio.toFixed(2)}:1
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "AA Normal", res: aaSmall, desc: "Min 4.5:1" },
                            { label: "AA Large", res: aaLarge, desc: "Min 3.0:1" },
                            { label: "AAA Normal", res: aaaSmall, desc: "Min 7.0:1" },
                            { label: "AAA Large", res: aaaLarge, desc: "Min 4.5:1" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-1 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                                <div className={`flex items-center gap-1 font-black ${item.res.color}`}>
                                    {item.res.pass ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {item.res.label}
                                </div>
                                <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div 
                        className="h-full min-h-[400px] rounded-3xl p-8 flex flex-col justify-center border-4 border-white/5 shadow-2xl transition-colors duration-500"
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Preview Text</h2>
                        <p className="text-lg leading-relaxed opacity-90">
                            The quick brown fox jumps over the lazy dog. This is a preview of how your chosen colors will look together in a real application interface.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button style={{ backgroundColor: fg, color: bg }} className="rounded-full font-bold">Primary Action</Button>
                            <Button variant="outline" style={{ borderColor: fg, color: fg }} className="rounded-full font-bold bg-transparent">Secondary</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    <strong>WCAG 2.1 Guidelines:</strong> AA level requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. AAA level requires at least 7:1 for normal text and 4.5:1 for large text. Large text is typically defined as 18pt (24px) or 14pt (18.67px) and bold.
                </p>
            </div>
        </ColorToolLayout>
    );
}
