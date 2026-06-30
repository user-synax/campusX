"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Zap, Flame, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";
import { getBannerUrl } from "@/utils/defaultBanner";

const THEMES = [
    {
        id: "midnight",
        name: "Midnight Stealth",
        bgClass: "bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-950 border border-white/10",
        pfpBorder: "border-neutral-900 ring-white/10",
        statsBg: "bg-white/5 border-white/5",
        badgeBg: "bg-white/5 border-white/10",
        progressBarTrack: "bg-white/10",
    },
    {
        id: "brand",
        name: "Campus Zen Blue",
        bgClass: "bg-linear-to-br from-slate-950 via-[#1A2E5A] to-slate-950 border border-[#3E63A6]/30",
        pfpBorder: "border-[#0d162d] ring-primary/30",
        statsBg: "bg-primary/5 border-primary/10",
        badgeBg: "bg-primary/5 border-primary/15",
        progressBarTrack: "bg-primary/10",
    },
    {
        id: "sunset",
        name: "Sunset Warmth",
        bgClass: "bg-linear-to-br from-[#1E0D1C] via-[#4A1A12] to-neutral-950 border border-orange-500/25",
        pfpBorder: "border-[#1c0c1b] ring-orange-500/30",
        statsBg: "bg-orange-500/5 border-orange-500/10",
        badgeBg: "bg-orange-500/5 border-orange-500/15",
        progressBarTrack: "bg-orange-500/10",
    },
    {
        id: "emerald",
        name: "Emerald Growth",
        bgClass: "bg-linear-to-br from-[#0B1E13] via-[#103A20] to-[#0a120e] border border-emerald-500/25",
        pfpBorder: "border-[#0a1b11] ring-emerald-500/30",
        statsBg: "bg-emerald-500/5 border-emerald-500/10",
        badgeBg: "bg-emerald-500/5 border-emerald-500/15",
        progressBarTrack: "bg-emerald-500/10",
    },
];

export default function ProfileCardExportModal({ open, onOpenChange, profileUser }) {
    const [activeTheme, setActiveTheme] = useState(THEMES[0]);
    const [exporting, setExporting] = useState(false);
    const cardRef = useRef(null);

    const handleExport = async () => {
        if (!cardRef.current) return;
        setExporting(true);

        // Wait a tiny bit for the UI/images to fully compute layouts
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.98,
                pixelRatio: 2.5, // Crisp high-definition export
                cacheBust: true,
                style: {
                    borderRadius: "0px", // Avoid corner clipping issues in output PNG
                },
            });

            const link = document.createElement("a");
            link.download = `${profileUser.username}-campuszen-card.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Profile card exported successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Card capture failed:", error);
            toast.error("Failed to generate image. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    if (!profileUser) return null;

    // Calculate level progress percentage
    const xpProgress = ((profileUser.xp || 0) % 1000) / 10;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-6 bg-card border-border overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold">Export Profile Card</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Showcase your accomplishments on social media with a customized profile card.
                    </DialogDescription>
                </DialogHeader>

                {/* Theme Selector */}
                <div className="space-y-2 mb-6">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Select Theme</span>
                    <div className="grid grid-cols-2 gap-2">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setActiveTheme(theme)}
                                className={`py-2 px-3 text-xs font-medium rounded-xl border text-left transition-all ${
                                    activeTheme.id === theme.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/50 hover:bg-muted text-foreground border-border"
                                }`}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Container (Target for capture) */}
                <div className="flex justify-center mb-6">
                    <div
                        ref={cardRef}
                        className={`w-[360px] p-5 rounded-2xl relative overflow-hidden flex flex-col text-white select-none ${activeTheme.bgClass}`}
                    >
                        {/* Banner Image */}
                        <div className="h-20 w-full relative rounded-xl overflow-hidden mb-8 border border-white/5 bg-zinc-800">
                            <img
                                src={getBannerUrl(profileUser.banner, profileUser.username)}
                                alt="Banner"
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        </div>

                        {/* Avatar */}
                        <div className="absolute top-[52px] left-1/2 -translate-x-1/2">
                            <div className={`w-16 h-16 rounded-full border-4 overflow-hidden shadow-xl ring-2 ${activeTheme.pfpBorder}`}>
                                <img
                                    src={profileUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.name}`}
                                    alt={profileUser.name}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </div>

                        {/* User Identifiers */}
                        <div className="text-center space-y-0.5 mb-5 mt-2">
                            <h2 className="text-base font-bold text-white flex items-center justify-center gap-1">
                                {profileUser.name}
                                {profileUser.isVerified && (
                                    <span className="text-sky-400 text-sm">✓</span>
                                )}
                            </h2>
                            <p className="text-xs text-white/50">@{profileUser.username}</p>
                            
                            {(profileUser.college || profileUser.course) && (
                                <p className="text-[10px] text-white/40 pt-1 font-medium truncate max-w-[280px] mx-auto">
                                    {profileUser.college ? `🎓 ${profileUser.college}` : ""}
                                    {profileUser.college && profileUser.course ? " • " : ""}
                                    {profileUser.course ? `${profileUser.course}` : ""}
                                </p>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <div className={`p-2 rounded-xl flex flex-col items-center justify-center border text-center ${activeTheme.statsBg}`}>
                                <Zap className="w-3.5 h-3.5 text-primary fill-primary mb-1" />
                                <span className="text-sm font-black leading-none">
                                    {profileUser.totalXP || profileUser.xp || 0}
                                </span>
                                <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider mt-0.5">
                                    Total XP
                                </span>
                            </div>

                            <div className={`p-2 rounded-xl flex flex-col items-center justify-center border text-center ${activeTheme.statsBg}`}>
                                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 mb-1" />
                                <span className="text-sm font-black leading-none">
                                    {profileUser.currentStreak || 0}
                                </span>
                                <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider mt-0.5">
                                    Streak
                                </span>
                            </div>

                            <div className={`p-2 rounded-xl flex flex-col items-center justify-center border text-center ${activeTheme.statsBg}`}>
                                <Trophy className="w-3.5 h-3.5 text-yellow-500 mb-1" />
                                <span className="text-sm font-black leading-none">
                                    {profileUser.level || 1}
                                </span>
                                <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider mt-0.5">
                                    Level
                                </span>
                            </div>
                        </div>

                        {/* Level Progress */}
                        <div className="space-y-1.5 mb-5">
                            <div className="flex justify-between items-center text-[9px] text-white/45 font-bold uppercase tracking-wider">
                                <span>Level Progress</span>
                                <span>{xpProgress}%</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${activeTheme.progressBarTrack}`}>
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Top Badges */}
                        {profileUser.badges?.length > 0 && (
                            <div className="space-y-2 mb-5">
                                <h3 className="text-[10px] font-bold text-white/45 uppercase tracking-wider flex items-center gap-1.5">
                                    <Medal className="w-3 h-3 text-primary" />
                                    Top Achievements
                                </h3>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {profileUser.badges.slice(0, 4).map((b, i) => b.badgeId && (
                                        <div
                                            key={i}
                                            className={`p-1.5 rounded-lg border flex items-center gap-1.5 overflow-hidden ${activeTheme.badgeBg}`}
                                        >
                                            <span className="text-sm shrink-0">{b.badgeId.icon || "🏅"}</span>
                                            <span className="text-[9px] font-semibold truncate text-white/80">
                                                {b.badgeId.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Watermark / Brand Branding */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-bold bg-linear-to-r from-primary to-sky-400 bg-clip-text text-transparent tracking-tight">
                                    CampusZen
                                </span>
                            </div>
                            <span className="text-[8px] text-white/35 font-semibold tracking-wider uppercase">
                                campuszen.vercel.app
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex gap-3 justify-end mt-4">
                    <Button variant="ghost" className="rounded-xl h-11" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="rounded-xl h-11 flex-1 sm:flex-initial"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
