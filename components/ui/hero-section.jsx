"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
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
}) {

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900",
        "py-12 sm:py-24 md:py-32 px-4"
      )}
    >
      {/* Animated Background with Moving Shades */}
      <div className="absolute inset-0 -z-10">
        {/* Purple Glow Effect */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-32 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-purple-700/25 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Golden Glow Effect */}
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-300" />
        
        {/* Moving Shade Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent animate-shimmer" />
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
          <h1 className="animate-appear bg-gradient-to-r from-white via-purple-200 to-yellow-200 bg-clip-text text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="animate-appear max-w-2xl text-lg text-gray-300 sm:text-xl delay-200">
            {description}
          </p>

          {/* Actions */}
          <div className="animate-appear flex flex-col sm:flex-row gap-4 justify-center delay-400">
            {actions.map((action, index) => (
              <Button 
                key={index} 
                variant={action.variant} 
                size="lg" 
                asChild
                className={action.variant === 'glow' 
                  ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary))]/25 border-[hsl(var(--primary))]/20"
                  : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary))]/25 border-[hsl(var(--primary))]/20"
                }
              >
                <a href={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bloom Effect from Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-bloom-up" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl animate-bloom-up delay-500" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-yellow-500/8 rounded-full blur-3xl animate-bloom-up delay-1000" />
      </div>
    </section>
  );
}
