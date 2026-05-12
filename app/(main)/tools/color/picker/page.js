"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Heart, Download, Palette, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function ColorPickerTool() {
    const [color, setColor] = useState("#6366f1");
    const [palette, setPalette] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [mounted, setMounted] = useState(false);

    const generatePalette = (baseColor) => {
        try {
            const colors = [
                chroma(baseColor).brighten(1.5).hex(),
                chroma(baseColor).brighten(0.7).hex(),
                baseColor,
                chroma(baseColor).darken(0.7).hex(),
                chroma(baseColor).darken(1.5).hex(),
            ];
            setPalette(colors);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("cz-color-favorites");
        if (saved) setFavorites(JSON.parse(saved));
        generatePalette("#6366f1");
    }, []);

    if (!mounted) return null;

    const handleColorChange = (newColor) => {
        if (chroma.valid(newColor)) {
            setColor(newColor);
            generatePalette(newColor);
        }
    };

    const copyToClipboard = (txt) => {
        navigator.clipboard.writeText(txt);
        toast.success(`Copied ${txt}`);
    };

    const toggleFavorite = (c) => {
        let newFavs;
        if (favorites.includes(c)) {
            newFavs = favorites.filter(f => f !== c);
            toast.info("Removed from favorites");
        } else {
            newFavs = [...favorites, c];
            toast.success("Added to favorites");
        }
        setFavorites(newFavs);
        localStorage.setItem("cz-color-favorites", JSON.stringify(newFavs));
    };

    const exportPalette = () => {
        const data = palette.join(", ");
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "palette.txt";
        a.click();
    };

    return (
        <ColorToolLayout
            title="Color Picker & Palette Generator"
            description="Select colors and instantly generate matching palettes for your next project."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Picker Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Base Color</Label>
                            <div className="flex gap-4 items-center">
                                <div 
                                    className="w-20 h-20 rounded-2xl shadow-inner border border-white/10 shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="flex-1 space-y-2">
                                    <Input 
                                        type="text" 
                                        value={color} 
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className="font-mono text-lg uppercase"
                                    />
                                    <div className="relative h-10 w-full overflow-hidden rounded-lg">
                                        <input 
                                            type="color" 
                                            value={color} 
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="absolute -inset-2 w-[120%] h-[120%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex flex-col gap-2">
                            <Button onClick={() => handleColorChange(chroma.random().hex())} variant="outline" className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Random Color
                            </Button>
                            <Button onClick={() => toggleFavorite(color)} variant="secondary" className="w-full">
                                <Heart className={`w-4 h-4 mr-2 ${favorites.includes(color) ? "fill-red-500 text-red-500" : ""}`} />
                                {favorites.includes(color) ? "Unfavorite" : "Favorite"}
                            </Button>
                        </div>
                    </div>

                    {favorites.length > 0 && (
                        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Favorites</Label>
                            <div className="flex flex-wrap gap-2">
                                {favorites.slice(-12).reverse().map((fav, i) => (
                                    <button 
                                        key={i}
                                        className="w-8 h-8 rounded-full border border-white/10 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: fav }}
                                        onClick={() => handleColorChange(fav)}
                                        title={fav}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Palette Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6 h-full">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-bold flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Generated Palette
                            </Label>
                            <Button variant="ghost" size="sm" onClick={exportPalette}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 h-[300px]">
                            {palette.map((c, i) => (
                                <div 
                                    key={i}
                                    className="group relative rounded-2xl overflow-hidden flex flex-col items-center justify-end p-4 transition-all hover:flex-[1.5]"
                                    style={{ backgroundColor: c }}
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <div className="relative z-10 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                                        <button 
                                            onClick={() => copyToClipboard(c)}
                                            className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-tighter">
                                            {c}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Suggestions</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { name: "Complementary", colors: chroma.scale([color, chroma(color).set('hsl.h', (chroma(color).get('hsl.h') + 180) % 360)]).colors(5) },
                                    { name: "Triadic", colors: [color, chroma(color).set('hsl.h', (chroma(color).get('hsl.h') + 120) % 360).hex(), chroma(color).set('hsl.h', (chroma(color).get('hsl.h') + 240) % 360).hex()] },
                                    { name: "Monochromatic", colors: chroma.scale([chroma(color).brighten(2), color, chroma(color).darken(2)]).colors(5) },
                                    { name: "Analogous", colors: [chroma(color).set('hsl.h', (chroma(color).get('hsl.h') - 30 + 360) % 360).hex(), color, chroma(color).set('hsl.h', (chroma(color).get('hsl.h') + 30) % 360).hex()] }
                                ].map((sch, i) => (
                                    <button 
                                        key={i}
                                        className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-left space-y-2"
                                        onClick={() => setPalette(sch.colors)}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{sch.name}</span>
                                        <div className="flex h-3 w-full rounded-full overflow-hidden">
                                            {sch.colors.map((c, j) => (
                                                <div key={j} className="flex-1" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ColorToolLayout>
    );
}
