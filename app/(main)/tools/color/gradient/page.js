"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Layers, ArrowRight, Settings2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function GradientGeneratorTool() {
    const [colors, setColors] = useState(["#6366f1", "#a855f7"]);
    const [angle, setAngle] = useState(135);
    const [type, setType] = useState("linear");
    const [css, setCss] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        generateCss();
    }, [colors, angle, type]);

    if (!mounted) return null;

    const generateCss = () => {
        const colorStr = colors.join(", ");
        let result = "";
        if (type === "linear") {
            result = `linear-gradient(${angle}deg, ${colorStr})`;
        } else {
            result = `radial-gradient(circle, ${colorStr})`;
        }
        setCss(result);
    };

    const updateColor = (index, val) => {
        const newColors = [...colors];
        newColors[index] = val;
        setColors(newColors);
    };

    const addColor = () => {
        if (colors.length < 5) {
            setColors([...colors, chroma.random().hex()]);
        } else {
            toast.error("Maximum 5 colors allowed");
        }
    };

    const removeColor = (index) => {
        if (colors.length > 2) {
            setColors(colors.filter((_, i) => i !== index));
        } else {
            toast.error("Minimum 2 colors required");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`background: ${css};`);
        toast.success("CSS copied to clipboard");
    };

    const randomize = () => {
        const count = Math.floor(Math.random() * 2) + 2;
        const newColors = Array.from({ length: count }, () => chroma.random().hex());
        setColors(newColors);
        setAngle(Math.floor(Math.random() * 360));
    };

    return (
        <ColorToolLayout
            title="Gradient Generator"
            description="Design beautiful linear and radial CSS gradients with multiple color stops and real-time preview."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Controls Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase text-muted-foreground">Gradient Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="radial">Radial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === "linear" && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-bold uppercase text-muted-foreground">Angle: {angle}°</Label>
                                </div>
                                <Slider 
                                    value={[angle]} 
                                    min={0} 
                                    max={360} 
                                    step={1} 
                                    onValueChange={(val) => setAngle(val[0])}
                                />
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold uppercase text-muted-foreground">Colors</Label>
                                <Button variant="ghost" size="icon" onClick={addColor} className="h-8 w-8 rounded-lg">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {colors.map((c, i) => (
                                    <div key={i} className="flex gap-2 items-center group">
                                        <div 
                                            className="w-10 h-10 rounded-lg border border-white/10 shrink-0 relative overflow-hidden"
                                            style={{ backgroundColor: c }}
                                        >
                                            <input 
                                                type="color" 
                                                value={c} 
                                                onChange={(e) => updateColor(i, e.target.value)}
                                                className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer opacity-0"
                                            />
                                        </div>
                                        <Input 
                                            value={c} 
                                            onChange={(e) => updateColor(i, e.target.value)}
                                            className="font-mono uppercase text-xs"
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeColor(i)}
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <Button onClick={randomize} variant="outline" className="w-full rounded-xl">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Randomize
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Preview & Code Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div 
                        className="h-[300px] rounded-3xl border-4 border-white/5 shadow-2xl relative group overflow-hidden"
                        style={{ background: css }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                            <span className="bg-white/90 text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl">Live Preview</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold uppercase text-muted-foreground">CSS Output</Label>
                            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 rounded-lg">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Code
                            </Button>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl font-mono text-sm break-all border border-border/50 text-primary-foreground/90">
                            background: {css};
                        </div>
                    </div>
                </div>
            </div>
        </ColorToolLayout>
    );
}
