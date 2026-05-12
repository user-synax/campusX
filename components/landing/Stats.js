"use client"

import { useEffect, useRef } from 'react'
import { gsap, shouldAnimate } from '@/lib/gsap-config'
import { Users, FileText, BookOpen, Code } from 'lucide-react'

export default function Stats({ users = 50, posts = 120, resources = 20, codeAreas = 3 }) {
  const sectionRef = useRef(null)
  const numberRefs = useRef([])

  const STATS_CONFIG = [
    { label: 'Users', value: users, suffix: '+', icon: Users, color: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Posts', value: posts, suffix: '+', icon: FileText, color: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Resources', value: resources, suffix: '+', icon: BookOpen, color: 'from-emerald-500/20 to-teal-500/20' },
    { label: 'Code Areas', value: codeAreas, suffix: '', icon: Code, color: 'from-orange-500/20 to-yellow-500/20' }
  ]

  useEffect(() => {
    if (!shouldAnimate()) {
      // No animation — just show values
      numberRefs.current.forEach((el, i) => {
        if (el && STATS_CONFIG[i]) el.textContent = STATS_CONFIG[i].value + STATS_CONFIG[i].suffix
      })
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      STATS_CONFIG.forEach((stat, i) => {
        const el = numberRefs.current[i]
        if (!el) return
        
        const obj = { val: 0 }
        gsap.to(obj, {
          val: stat.value,
          duration: 2.5,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + stat.suffix
          },
          onComplete: () => {
            el.textContent = stat.value + stat.suffix
          }
        })
      })
    }, { threshold: 0.2 })

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [users, posts, resources, codeAreas])

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-white/40 uppercase tracking-[0.2em] mb-4">
            Platform Impact
          </h2>
          <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Trusted by students across India
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" ref={sectionRef}>
          {STATS_CONFIG.map((stat, i) => (
            <div key={i} className="relative p-6 rounded-3xl overflow-hidden bg-card group border border-border">
              {/* decorative grid pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden>
                <rect width="100%" height="100%" fill="none" />
                <g stroke="#2a2a2a" strokeWidth="0.8" fill="#ffffff14">
                  <circle cx="20" cy="20" r="2" />
                  <circle cx="60" cy="40" r="2" />
                  <circle cx="120" cy="30" r="2" />
                  <circle cx="170" cy="70" r="2" />
                  <circle cx="30" cy="120" r="2" />
                  <circle cx="80" cy="160" r="2" />
                </g>
              </svg>

              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5">
                  <stat.icon className="w-7 h-7 text-white/80" />
                </div>

                <div
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter"
                  ref={el => numberRefs.current[i] = el}
                >
                  {stat.value}{stat.suffix}
                </div>

                <div className="text-white/40 text-sm font-bold uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
