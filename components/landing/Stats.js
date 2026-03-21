"use client"

import { useEffect, useRef } from 'react'
import { gsap, shouldAnimate } from '@/lib/gsap-config'
import { Users, FileText, GraduationCap } from 'lucide-react'

export default function Stats({ users = 0, posts = 0, communities = 0 }) {
  const sectionRef = useRef(null)
  const numberRefs = useRef([])

  const STATS_CONFIG = [
    { label: 'Students', value: users, suffix: '+', icon: Users, color: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Posts Shared', value: posts, suffix: '+', icon: FileText, color: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Communities', value: communities, suffix: '', icon: GraduationCap, color: 'from-orange-500/20 to-yellow-500/20' }
  ]

  useEffect(() => {
    if (!shouldAnimate()) {
      // No animation — just show values
      numberRefs.current.forEach((el, i) => {
        if (el) el.textContent = STATS_CONFIG[i].value + STATS_CONFIG[i].suffix
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
  }, [users, posts, communities])

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-[#0f0f0f]">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" ref={sectionRef}>
          {STATS_CONFIG.map((stat, i) => (
            <div 
              key={i} 
              className={`relative group p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${stat.color} backdrop-blur-md transition-all duration-500 hover:border-white/10 hover:-translate-y-1`}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5">
                  <stat.icon className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-1">
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
              </div>
              
              {/* Subtle light effect on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
