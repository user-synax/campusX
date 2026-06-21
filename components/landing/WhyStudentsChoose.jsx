"use client";

import { BookOpen, Users, UserPlus, Award } from "lucide-react";

export default function WhyStudentsChoose() {
    const features = [
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

    return (
        <section className="py-24 px-4 bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-2xl font-bold text-white/40 uppercase tracking-[0.2em]">
                        Why choose CampusZen
                    </h2>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Why students choose CampusZen
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative p-8 rounded-[2rem] border border-white/5 bg-card overflow-hidden transition-all duration-500 hover:bg-[#1a1a1a] hover:border-white/10 hover:-translate-y-1"
                            >
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <Icon className="w-8 h-8 text-white/80" />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-white/40 text-base leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
