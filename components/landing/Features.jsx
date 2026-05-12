"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Users,
    BookOpen,
    Code,
    MessageCircle,
    Layers,
    Globe,
    Zap,
    ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Verified Campus Tribe",
        description: "Join a growing community of verified students from IITs, NITs, and top colleges across India.",
        header: <SkeletonOne />,
        icon: <Users className="h-4 w-4 text-blue-500 group-hover/bento:text-blue-400 transition-colors" />,
        className: "md:col-span-2",
    },
    {
        title: "The Ultimate Resource Vault",
        description: "Access free notes, PYQs, and premium study materials reviewed by toppers.",
        header: <SkeletonTwo />,
        icon: <BookOpen className="h-4 w-4 text-emerald-500 group-hover/bento:text-emerald-400 transition-colors" />,
        className: "md:col-span-1",
    },
    {
        title: "Code Together, Grow Together",
        description: "Real-time collaborative editor for coding sessions and interview prep.",
        header: <SkeletonThree />,
        icon: <Code className="h-4 w-4 text-orange-500 group-hover/bento:text-orange-400 transition-colors" />,
        className: "md:col-span-1",
    },
    {
        title: "Instant Campus Buzz",
        description: "Stay updated with real-time group chats and campus-wide announcements.",
        header: <SkeletonFour />,
        icon: <Zap className="h-4 w-4 text-purple-500 group-hover/bento:text-purple-400 transition-colors" />,
        className: "md:col-span-2",
    },
];

function SkeletonOne() {
    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 border border-neutral-800/50">
            <div className="flex flex-row items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0 animate-pulse" />
                <div className="h-4 w-32 rounded-full bg-neutral-800 animate-pulse" />
            </div>
        </div>
    );
}

function SkeletonTwo() {
    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 border border-neutral-800/50">
            <div className="flex flex-col space-y-2">
                <div className="h-4 w-full rounded-full bg-neutral-800 animate-pulse" />
                <div className="h-4 w-3/4 rounded-full bg-neutral-800 animate-pulse" />
            </div>
        </div>
    );
}

function SkeletonThree() {
    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 border border-neutral-800/50 flex items-center justify-center">
             <Code className="h-12 w-12 text-primary/20" />
        </div>
    );
}

function SkeletonFour() {
    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 border border-neutral-800/50">
            <div className="flex items-center justify-center w-full h-full">
                <div className="h-8 w-full rounded-lg bg-primary/10 animate-pulse" />
            </div>
        </div>
    );
}

export default function Features() {
    return (
        <section className="relative bg-background py-20" id="features">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Everything your campus needs
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        From study resources to late-night bakchodi, we've got you covered.
                        The all-in-one platform for the modern Indian student.
                    </p>
                </div>

                <BentoGrid className="max-w-4xl mx-auto">
                    {features.map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            icon={item.icon}
                            className={item.className}
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
}
