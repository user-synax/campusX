"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} HeroAction
 * @property {string} text
 * @property {string} href
 * @property {React.ReactNode} [icon]
 * @property {'default'|'glow'} [variant]
 */

/**
 * @typedef {Object} HeroProps
 * @property {Object} [badge]
 * @property {string} badge.text
 * @property {Object} badge.action
 * @property {string} badge.action.text
 * @property {string} badge.action.href
 * @property {string} title
 * @property {string} description
 * @property {HeroAction[]} actions
 * @property {Object} image
 * @property {string} image.light
 * @property {string} image.dark
 * @property {string} image.alt
 */

export function HeroSection({
  badge,
  title,
  description,
  actions,
  titleRotatingText,
}) {

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        "bg-[#050505]",
        "py-12 sm:py-24 md:py-32 px-4"
      )}
    >
      {/* Modern Minimalist Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Soft Radial Glows - Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#7c3aed]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[10%] right-[-10%] w-[70%] h-[70%] bg-[#4f46e5]/15 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        {/* Strong Bottom-to-Top Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-gradient-to-t from-[#7c3aed]/40 via-[#7c3aed]/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[140%] h-[40vh] bg-[#7c3aed]/25 blur-[120px] rounded-[100%] pointer-events-none" />
        
        {/* Additional accent glows at bottom */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3b82f6]/25 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/25 rounded-full blur-[100px] animate-pulse delay-1000 pointer-events-none" />
        
        {/* Bright flare at the very bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/60 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-[#7c3aed]/40 blur-md" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2 border-purple-500/30 bg-purple-500/10 text-purple-200">
              <span>{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1 text-purple-300 hover:text-purple-200">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="animate-appear flex flex-col sm:flex-row sm:flex-wrap items-center justify-center bg-gradient-to-b from-white via-white/90 to-neutral-400 bg-clip-text text-5xl font-black tracking-tighter text-transparent drop-shadow-2xl sm:text-7xl sm:leading-tight md:text-8xl md:leading-[1.1] px-2 text-center">
            {titleRotatingText ? (
              <>
                <span className="whitespace-nowrap">{titleRotatingText.prefix}</span>
                <div className="my-2 sm:my-0">
                  {titleRotatingText.component}
                </div>
                <span className="whitespace-nowrap">{titleRotatingText.suffix}</span>
              </>
            ) : (
              title
            )}
          </h1>

          {/* Description */}
          <p className="animate-appear max-w-2xl text-base text-gray-400 sm:text-xl delay-200 px-6 sm:px-4">
            {description}
          </p>

          {/* Actions */}
          <div className="animate-appear flex flex-col sm:flex-row gap-4 justify-center delay-400 w-full max-w-[300px] sm:max-w-none mx-auto px-4 sm:px-0">
            {actions.map((action, index) => (
              <Button 
                key={index} 
                variant={action.variant} 
                size="lg" 
                asChild
                className={cn(
                  "rounded-full w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg px-8",
                  action.variant === 'glow' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/20"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-sm"
                )}
              >
                <Link href={action.href} className="flex items-center justify-center gap-2">
                  {action.icon}
                  {action.text}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
