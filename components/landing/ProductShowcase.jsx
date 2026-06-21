"use client";

import Image from "next/image";

export default function ProductShowcase() {
    return (
        <section className="py-24 px-4 bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-2xl font-bold text-white/40 uppercase tracking-[0.2em]">
                        See it in action
                    </h2>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        CampusZen in action
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Student Feed */}
                    <div className="group relative p-4 rounded-[2rem] border border-white/5 bg-card overflow-hidden transition-all duration-500 hover:bg-[#1a1a1a] hover:border-white/10 hover:-translate-y-1">
                        <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-[#141414] border border-white/5">
                            <Image
                                src="/p1.png"
                                alt="Student Feed feature showing campus posts"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="mt-6 space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                Student Feed
                            </h3>
                            <p className="text-white/40 text-base leading-relaxed font-medium">
                                Stay connected with your campus community in
                                real-time.
                            </p>
                        </div>
                    </div>

                    {/* Resource Vault */}
                    <div className="group relative p-4 rounded-[2rem] border border-white/5 bg-card overflow-hidden transition-all duration-500 hover:bg-[#1a1a1a] hover:border-white/10 hover:-translate-y-1">
                        <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-[#141414] border border-white/5">
                            <Image
                                src="/p2.png"
                                alt="Resource Vault showing study materials"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="mt-6 space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                Resource Vault
                            </h3>
                            <p className="text-white/40 text-base leading-relaxed font-medium">
                                Access verified notes, PYQs, and formula sheets.
                            </p>
                        </div>
                    </div>

                    {/* Campus Communities */}
                    <div className="group relative p-4 rounded-[2rem] border border-white/5 bg-card overflow-hidden transition-all duration-500 hover:bg-[#1a1a1a] hover:border-white/10 hover:-translate-y-1">
                        <div className="relative aspect-[4/3] w-full rounded-[1.5rem] overflow-hidden bg-[#141414] border border-white/5">
                            <Image
                                src="/p3.png"
                                alt="Campus Communities showing code areas"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="mt-6 space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                Campus Communities
                            </h3>
                            <p className="text-white/40 text-base leading-relaxed font-medium">
                                Join interest-based communities and code areas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
