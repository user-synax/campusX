"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

const floatingOrbVariants = {
  float: {
    y: [-20, 20],
    x: [-10, 10],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
}

const pulseOrbVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function Hero() {

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Modern animated background */}
            <div className="absolute inset-0 -z-10">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
                
                {/* Animated orbs */}
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
                    variants={floatingOrbVariants}
                    animate="float"
                    style={{ animationDelay: '0s' }}
                />
                <motion.div
                    className="absolute top-40 right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                    variants={pulseOrbVariants}
                    animate="pulse"
                    style={{ animationDelay: '1s' }}
                />
                <motion.div
                    className="absolute bottom-32 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
                    variants={floatingOrbVariants}
                    animate="float"
                    style={{ animationDelay: '2s' }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
                    variants={pulseOrbVariants}
                    animate="pulse"
                    style={{ animationDelay: '1.5s' }}
                />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="h-full w-full bg-grid-pattern" />
                </div>
                
                {/* Gradient mesh overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-7xl lg:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl"
                    >
                        India ka apna
                        <span className="text-white">{' '}Student Social Network</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mx-auto mb-8 max-w-2xl text-lg text-white/70 md:text-xl drop-shadow-lg"
                    >
                        Posts, chats, notes, code area — sab ek jagah. Sirf
                        apne college waalon ke saath. Free. Forever.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/signup" className="w-full sm:w-auto">
                                <Button className="group relative overflow-hidden gap-2 rounded-full px-8 text-base flex items-center justify-center bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[#0f0f0f]">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Join Free
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </span>
                                    {/* animated sheen */}
                                    <span aria-hidden className="absolute inset-0 z-0 pointer-events-none transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out">
                                        <span className="absolute inset-0 bg-linear-to-r from-white/30 via-white/60 to-white/30 opacity-60 blur-md mix-blend-screen" />
                                    </span>
                                    {/* shiny border */}
                                    <span aria-hidden className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
                                </Button>
                        </Link>

                        <Link href="#features" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="group gap-2 rounded-full px-8 text-base flex items-center justify-center border-white/10 text-[#f0f0f0] hover:cursor-pointer"
                            >
                                See How It Works
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
