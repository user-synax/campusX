"use client";

import { HeroSection } from "@/components/ui/hero-section";
import { ArrowRight, Smartphone } from "lucide-react";
import RotatingText from "@/components/ui/RotatingText";

export function HeroSectionDemo() {
    return (
        <HeroSection
            badge={{
                text: `बलिदान परम धर्म: 🇮🇳`,
            }}
            titleRotatingText={{
                prefix: "Own Your",
                component: (
                    <RotatingText
                        texts={[
                            "Hustle",
                            "Network",
                            "Profile",
                            "Journey",
                            "Future",
                            "Campus",
                            "Career",
                            "Projects",
                            "Success",
                        ]}
                        mainClassName="px-3 sm:px-4 bg-primary text-primary-foreground overflow-hidden py-0.5 sm:py-1 justify-center rounded-xl sm:rounded-2xl inline-flex shadow-2xl border border-primary/50"
                        staggerFrom={"last"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-1"
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 400,
                        }}
                        rotationInterval={2500}
                    />
                ),
                suffix: "",
            }}
            description="The ultimate campus ecosystem to build your network, crush your goals, and vibe with your tribe. All in one place."
            actions={[
                {
                    text: "Join Your Tribe",
                    href: "/signup",
                    variant: "glow",
                },
                {
                    text: "Explore Features",
                    href: "#features",
                    variant: "ghost",
                    icon: <ArrowRight className="h-5 w-5" />,
                },
            ]}
        />
    );
}
