"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-[#f0f0f0] overflow-hidden relative">
            {/* Branding Header */}
            <header className="absolute top-0 w-full p-6 flex justify-center z-20">
                <Logo size="lg" />
            </header>

            {/* Animated Background Content */}
            <div className="absolute inset-0 z-0">
                {/* Subtle mesh gradients */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

                {/* Drifting circles (CSS only) */}
                <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-white/20 rounded-full animate-float" />
                <div className="absolute top-[80%] left-[80%] w-3 h-3 bg-white/10 rounded-full animate-float-delayed" />
                <div className="absolute top-[50%] left-[5%] w-1.5 h-1.5 bg-white/20 rounded-full animate-float-reverse" />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
                {/* 404 Text with Gradient */}
                <div className="relative mb-8">
                    <h1
                        className="text-9xl md:text-[12rem] font-black tracking-tighter select-none leading-none
                          bg-linear-to-br from-[#6c3bff] via-campus-blue to-[#8b5cf6] 
                          bg-clip-text text-transparent drop-shadow-2xl"
                    >
                        404
                    </h1>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-ping" />
                </div>

                <div className="space-y-4 max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Page Not Found
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed">
                        Looks like this page took a gap year 👀
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-sm justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 shadow-xl shadow-primary/20"
                    >
                        <Link href="/feed">Go to Feed</Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="rounded-full border border-white/10 hover:bg-white/5 h-14 px-8"
                    >
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -40px); }
        }
        @keyframes shadow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 15s ease-in-out infinite 2s;
        }
        .animate-float-reverse {
          animation: float 12s ease-in-out infinite reverse;
        }
      `,
                }}
            />
        </div>
    );
}
