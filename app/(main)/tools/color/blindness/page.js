"use client";

import { useState, useEffect } from "react";
import { Eye, Copy, RefreshCw, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";
import blinder from "color-blind";

export default function BlindnessSimulatorTool() {
    const [color, setColor] = useState("#6366f1");
    const [simulations, setSimulations] = useState([]);

    const runSimulations = (val) => {
        if (!chroma.valid(val)) return;
        
        setSimulations([
            { name: "Protanopia", type: "Red-Blind", desc: "Missing red cones", color: blinder.protanopia(val) },
            { name: "Deuteranopia", type: "Green-Blind", desc: "Missing green cones", color: blinder.deuteranopia(val) },
            { name: "Tritanopia", type: "Blue-Blind", desc: "Missing blue cones", color: blinder.tritanopia(val) },
            { name: "Protanomaly", type: "Red-Weak", desc: "Reduced red sensitivity", color: blinder.protanomaly(val) },
            { name: "Deuteranomaly", type: "Green-Weak", desc: "Reduced green sensitivity", color: blinder.deuteranomaly(val) },
            { name: "Tritanomaly", type: "Blue-Weak", desc: "Reduced blue sensitivity", color: blinder.tritanomaly(val) },
            { name: "Achromatopsia", type: "Total-Blind", desc: "No color vision", color: blinder.achromatopsia(val) },
            { name: "Achromatomaly", type: "Total-Weak", desc: "Partial color vision", color: blinder.achromatomaly(val) },
        ]);
    };

    useEffect(() => {
        runSimulations(color);
    }, [color]);

    const copyToClipboard = (txt) => {
        navigator.clipboard.writeText(txt);
        toast.success(`Copied ${txt.toUpperCase()}`);
    };

    return (
        <ColorToolLayout
            title="Color Blindness Simulator"
            description="Visualize how your chosen color appears to individuals with different types of color vision deficiencies."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Normal Vision</Label>
                            <div className="flex gap-4 items-center">
                                <div 
                                    className="w-20 h-20 rounded-2xl shadow-xl border border-white/10 shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="flex-1 space-y-2">
                                    <Input 
                                        type="text" 
                                        value={color} 
                                        onChange={(e) => setColor(e.target.value)}
                                        className="font-mono text-lg uppercase"
                                    />
                                    <div className="relative h-10 w-full overflow-hidden rounded-lg">
                                        <input 
                                            type="color" 
                                            value={color} 
                                            onChange={(e) => setColor(e.target.value)}
                                            className="absolute -inset-2 w-[120%] h-[120%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" />
                            Accessibility Note
                        </div>
                        <p className="text-[10px] text-amber-200/70 leading-relaxed">
                            Approximately 1 in 12 men and 1 in 200 women are affected by color blindness. Always use text or patterns in addition to color to convey meaning.
                        </p>
                    </div>
                </div>

                {/* Simulations Section */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {simulations.map((sim, i) => (
                            <div 
                                key={i} 
                                className="p-5 rounded-2xl border border-border bg-card flex items-center gap-4 group hover:border-primary/40 transition-all duration-300"
                            >
                                <div 
                                    className="w-16 h-16 rounded-xl border border-white/10 shadow-inner shrink-0"
                                    style={{ backgroundColor: sim.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-sm tracking-tight">{sim.name}</h3>
                                        <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{sim.type}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{sim.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold uppercase">{sim.color}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => copyToClipboard(sim.color)}
                                            className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ColorToolLayout>
    );
}
