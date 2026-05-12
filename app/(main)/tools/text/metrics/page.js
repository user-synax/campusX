"use client";

import { useState, useEffect } from "react";
import { Calculator, Type, FileText, AlignLeft, Hash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextToolLayout from "@/components/tools/TextToolLayout";

export default function TextMetricsTool() {
    const [input, setInput] = useState("");
    const [metrics, setMetrics] = useState({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
    });

    const calculateMetrics = () => {
        const text = input || "";
        const trimmed = text.trim();
        
        setMetrics({
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, "").length,
            words: trimmed ? trimmed.split(/\s+/).length : 0,
            sentences: trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0,
            paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0,
            lines: text ? text.split("\n").length : 0,
        });
    };

    useEffect(() => {
        calculateMetrics();
    }, [input]);

    const MetricCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center text-center space-y-2">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</h3>
            <p className="text-2xl font-black">{value.toLocaleString()}</p>
        </div>
    );

    return (
        <TextToolLayout
            title="Text Metrics"
            description="Get detailed statistics about your text, including character, word, sentence, and paragraph counts."
        >
            <div className="space-y-8">
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Input Text</Label>
                    <Textarea
                        placeholder="Type or paste your text here for instant analysis..."
                        className="min-h-[300px] text-lg leading-relaxed"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <MetricCard icon={Type} label="Characters" value={metrics.characters} color="blue" />
                    <MetricCard icon={AlignLeft} label="Words" value={metrics.words} color="green" />
                    <MetricCard icon={FileText} label="Sentences" value={metrics.sentences} color="purple" />
                    <MetricCard icon={AlignLeft} label="Paragraphs" value={metrics.paragraphs} color="orange" />
                    <MetricCard icon={Hash} label="Lines" value={metrics.lines} color="pink" />
                    <MetricCard icon={Type} label="No Spaces" value={metrics.charactersNoSpaces} color="cyan" />
                </div>

                <div className="bg-muted/30 border border-border rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Word Frequency (Top 10)</h3>
                    <div className="flex flex-wrap gap-2">
                        {input.trim() ? (
                            Object.entries(
                                input.toLowerCase()
                                    .replace(/[^\w\s]/g, "")
                                    .split(/\s+/)
                                    .reduce((acc, word) => {
                                        if (word.length > 2) acc[word] = (acc[word] || 0) + 1;
                                        return acc;
                                    }, {})
                            )
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([word, count]) => (
                                <div key={word} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                                    <span className="font-medium">{word}</span>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Enter text to see word frequency...</p>
                        )}
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
