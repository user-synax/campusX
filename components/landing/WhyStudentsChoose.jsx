"use client";

import { BookOpen, Users, UserPlus, Award } from "lucide-react";

const FEATURES = [
    {
        icon: BookOpen,
        title: "Learn Faster",
        description: "Access notes, PYQs, and curated resources.",
    },
    {
        icon: Users,
        title: "Build Together",
        description: "Find teammates for hackathons and projects.",
    },
    {
        icon: UserPlus,
        title: "Grow Your Network",
        description: "Connect with ambitious students across campuses.",
    },
    {
        icon: Award,
        title: "Showcase Your Work",
        description: "Build a profile that highlights your achievements.",
    },
];

export default function WhyStudentsChoose() {
    return (
        <section className="bg-[#0a0a0c] px-4 py-24 md:py-32">
            <div className="max-w-6xl mx-auto">
                <div className="max-w-2xl mb-16 md:mb-20">
                    <span className="block text-xs font-bold tracking-[0.18em] uppercase text-[#3E63A6] mb-5">
                        Why CampusZen
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] text-[#F2F3F5] mb-5">
                        Why students choose{" "}
                        <span className="text-[#3E63A6]">CampusZen</span>
                    </h2>
                    <p className="text-[#9098A8] text-base md:text-lg leading-relaxed">
                        Built around what actually matters to students — useful
                        resources, real connections, and a network that lasts
                        beyond graduation.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-[#202024] bg-[#0e1014] p-7 transition-colors duration-300 hover:border-[#2c2c33]"
                            >
                                <div className="w-11 h-11 flex items-center justify-center bg-[#3E63A6] rounded-md mb-6">
                                    <Icon
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
