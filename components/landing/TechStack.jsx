"use client";

import { LogoLoop } from "@/components/ui/LogoLoop";
import { 
    SiReact, 
    SiNextdotjs, 
    SiMongodb, 
    SiTailwindcss, 
    SiFramer, 
    SiVercel,
    SiTypescript,
    SiNodedotjs,
    SiJavascript,
    SiGithub
} from "react-icons/si";

const techLogos = [
    { node: <SiReact className="text-[#61DAFB]" />, title: "React" },
    { node: <SiNextdotjs className="text-white" />, title: "Next.js" },
    { node: <SiMongodb className="text-[#47A248]" />, title: "MongoDB" },
    { node: <SiTailwindcss className="text-[#06B6D4]" />, title: "Tailwind CSS" },
    { node: <SiFramer className="text-white" />, title: "Framer Motion" },
    { node: <SiVercel className="text-white" />, title: "Vercel" },
    { node: <SiTypescript className="text-[#3178C6]" />, title: "TypeScript" },
    { node: <SiNodedotjs className="text-[#339933]" />, title: "Node.js" },
    { node: <SiJavascript className="text-[#F7DF1E]" />, title: "JavaScript" },
    { node: <SiGithub className="text-white" />, title: "GitHub" },
];

export default function TechStack() {
    return (
        <section className="py-12 bg-[#050505] border-y border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Powered by modern tech
                </p>
            </div>
            <div className="relative">
                <LogoLoop 
                    logos={techLogos} 
                    speed={40} 
                    direction="left" 
                    logoHeight={32} 
                    gap={60} 
                    hoverSpeed={10} 
                    scaleOnHover 
                    fadeOut 
                    fadeOutColor="#050505" 
                    ariaLabel="Technology stack" 
                />
            </div>
        </section>
    );
}
