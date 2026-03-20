"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * Reusable Logo component for CampusX.
 * @param {Object} props
 * @param {string} props.className - Additional classes for the container
 * @param {boolean} props.showText - Whether to show the "CampusX" text
 * @param {string} props.size - Size of the icon ('sm', 'md', 'lg')
 * @param {string} props.href - Destination link (defaults to /feed)
 */
export default function Logo({ 
  className, 
  showText = true, 
  size = "md", 
  href = "/feed" 
}) {
  const iconSizes = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-3 group transition-transform active:scale-95", className)}
    >
      <div className={cn(
        "rounded-xl bg-white flex items-center justify-center font-bold text-black shadow-lg shadow-white/10 transition-all group-hover:shadow-white/20",
        iconSizes[size] || iconSizes.md
      )}>
        C
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground",
          textSizes[size] || textSizes.md
        )}>
          Campus<span className="text-primary">X</span>
        </span>
      )}
    </Link>
  )
}
