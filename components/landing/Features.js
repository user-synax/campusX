"use client";

import { useRef } from "react";
import { gsap, shouldAnimate } from "@/lib/gsap-config";
import { useGSAP } from "@/hooks/useGSAP";
import {
    MessageSquare,
    Users2,
    Calendar,
    UserX,
    BarChart3,
    BookOpen,
    ShieldCheck,
} from "lucide-react";

const FEATURES = [
    {
        icon: MessageSquare,
        title: "Campus Feed",
        description:
            "Share posts, updates and thoughts with your entire college community in real time.",
    },
    {
        icon: Users2,
        title: "College Communities",
        description:
            "Join communities for your branch, year, or interest. College-specific, always relevant.",
    },
    {
        icon: Calendar,
        title: "Campus Events",
        description:
            "Discover hackathons, fests, seminars. RSVP and never miss what matters.",
    },
    {
        icon: UserX,
        title: "Anonymous Posts",
        description:
            "Share confessions, doubts, or opinions without revealing your identity.",
    },
    {
        icon: BarChart3,
        title: "Polls & Reactions",
        description:
            "Create polls, react with emotions, start conversations that go beyond likes.",
    },
    {
        icon: BookOpen,
        title: "Study Resources",
        description:
            "Verified notes, PYQs, formula sheets — uploaded by seniors, free forever.",
    },
];

export default function Features() {
    const gridRef = useRef(null);

    useGSAP(() => {
        if (!shouldAnimate()) return;

        const cards = gridRef.current?.querySelectorAll(".feature-card");
        if (!cards) return;

        gsap.fromTo(
            cards,
            { opacity: 0, y: 24 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 85%",
                    once: true,
                },
            },
        );
    }, []);

    return (
        <section id="features" className="bg-[#0a0a0c] px-4 py-24 md:py-32">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="max-w-2xl mb-16 md:mb-20">
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldCheck
                            className="w-4 h-4 text-[#3E63A6]"
                            strokeWidth={2}
                        />
                        <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#3E63A6]">
                            Trusted by your campus
                        </span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] text-[#F2F3F5] mb-5">
                        Everything your campus needs, built on{" "}
                        <span className="text-[#3E63A6]">trust</span>
                    </h2>
                    <p className="text-[#9098A8] text-base md:text-lg leading-relaxed">
                        One dependable platform for every student — moderated,
                        verified, and built to last all four years.
                    </p>
                </div>

                {/* Features grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
                >
                    {FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className="feature-card bg-[#0e1014] border border-[#202024] border-l-4 border-l-[#3E63A6] rounded-sm p-8"
                        >
                            <div className="w-11 h-11 flex items-center justify-center bg-[#3E63A6] rounded-sm mb-7">
                                <feature.icon
                                    className="w-5 h-5 text-[#F2F3F5]"
                                    strokeWidth={1.75}
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-[#F2F3F5] tracking-tight mb-2.5">
                                {feature.title}
                            </h3>
                            <p className="text-[#9098A8] text-[15px] leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
