"use client";

import { useState, useEffect } from "react";
import { Timer, MessageSquare, BookOpen, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import TextToolLayout from "@/components/tools/TextToolLayout";

export default function ReadingTimeTool() {
    const [input, setInput] = useState("");
    const [readingSpeed, setReadingSpeed] = useState(200); // wpm
    const [speakingSpeed, setSpeakingSpeed] = useState(130); // wpm
    const [stats, setStats] = useState({
        words: 0,
        readingTime: 0,
        speakingTime: 0,
    });

    const calculateStats = () => {
        const words = input.trim() ? input.trim().split(/\s+/).length : 0;
        const readingTime = Math.ceil(words / readingSpeed);
        const speakingTime = Math.ceil(words / speakingSpeed);

        setStats({
            words,
            readingTime,
            speakingTime,
        });
    };

    useEffect(() => {
        calculateStats();
    }, [input, readingSpeed, speakingSpeed]);

    const formatTime = (minutes) => {
        if (minutes < 1) return "Less than a minute";
        if (minutes === 1) return "1 minute";
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <TextToolLayout
            title="Reading & Speaking Time Estimator"
            description="Estimate how long it will take to read or speak your text based on average speeds."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Reading Speed
                                </Label>
                                <span className="text-sm font-bold">{readingSpeed} wpm</span>
                            </div>
                            <Slider 
                                value={[readingSpeed]} 
                                min={100} 
                                max={500} 
                                step={10} 
                                onValueChange={(val) => setReadingSpeed(val[0])}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Avg: 200-250 wpm</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Speaking Speed
                                </Label>
                                <span className="text-sm font-bold">{speakingSpeed} wpm</span>
                            </div>
                            <Slider 
                                value={[speakingSpeed]} 
                                min={80} 
                                max={250} 
                                step={5} 
                                onValueChange={(val) => setSpeakingSpeed(val[0])}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Avg: 130-150 wpm</p>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Words</span>
                                <span className="font-mono font-bold">{stats.words}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Your Text</Label>
                        <Textarea
                            placeholder="Paste your script, article, or speech here..."
                            className="min-h-[300px] text-lg leading-relaxed"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-3xl bg-linear-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-500">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Reading Time</h3>
                                <p className="text-3xl font-black mt-1">{formatTime(stats.readingTime)}</p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-500">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Speaking Time</h3>
                                <p className="text-3xl font-black mt-1">{formatTime(stats.speakingTime)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
