"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { gsap, shouldAnimate } from '@/lib/gsap-config'
import { useGSAP } from '@/hooks/useGSAP'

export default function Hero() {
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const floatingRef = useRef(null)

  useGSAP(() => {
    if (!shouldAnimate()) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(headlineRef.current, 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 1 }
    )
    .fromTo(subRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8 }, 
      '-=0.6'
    )
    .fromTo(ctaRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      '-=0.4'
    )

    // Floating animation for background elements
    const elements = floatingRef.current?.children
    if (elements) {
      gsap.to(Array.from(elements), {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      })
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-[#0f0f0f]">
      {/* Animated background — CSS only, no JS */}
      <div className="absolute inset-0 -z-10" ref={floatingRef}>
        {/* Gradient mesh */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-orange-500/5 rounded-full blur-3xl opacity-30" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '64px 64px' 
          }} 
        />
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Exclusive for College Students and learners
        </div>

        {/* Headline — GSAP animated on mount */}
        <div className="space-y-4">
          <h1 
            ref={headlineRef} 
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] text-white"
          >
            Connect with your <br />
            <span 
              className="inline-block" 
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #8b5cf6, #3b82f6)', 
                WebkitBackgroundClip: 'text', 
                webkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                webkitTextFillColor: 'transparent'
              }} 
            >
              Campus.
            </span>
          </h1>
        </div>
        <p 
          ref={subRef} 
          className="text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Join a thriving community of students. Share updates, <br className="hidden md:block" />
          discover events, and find resources that matter to you.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full bg-white text-black hover:bg-white/90 hover:bg-linear-to-l hover:cursor-pointer transition-all shadow-xl shadow-white/5">
              Join CampusX Now
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full border-white/10 hover:cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
              Explore Features
            </Button>
          </a>
        </div>

        {/* Social proof */}
        {/* <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f0f0f] bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold">
                U{i}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#0f0f0f] bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white/60">
              +1k
            </div>
          </div>
          <p className="text-sm font-medium text-white/40 uppercase tracking-widest">
            Trusted by students across 100+ colleges
          </p>
        </div> */}
      </div>
    </section>
  )
}
