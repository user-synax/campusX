"use client"

import { useRef } from 'react'
import { gsap, shouldAnimate } from '@/lib/gsap-config'
import { useGSAP } from '@/hooks/useGSAP'
import { 
  MessageSquare, 
  Users2, 
  Calendar, 
  UserX, 
  BarChart3, 
  BookOpen 
} from 'lucide-react'

const FEATURES = [ 
  { 
    icon: MessageSquare, 
    title: 'Campus Feed', 
    description: 'Share posts, updates and thoughts with your entire college community in real time.', 
    color: '#3b82f6' 
  }, 
  { 
    icon: Users2, 
    title: 'College Communities', 
    description: 'Join communities for your branch, year, or interest. College-specific, always relevant.', 
    color: '#8b5cf6' 
  }, 
  { 
    icon: Calendar, 
    title: 'Campus Events', 
    description: 'Discover hackathons, fests, seminars. RSVP and never miss what matters.', 
    color: '#f59e0b' 
  }, 
  { 
    icon: UserX, 
    title: 'Anonymous Posts', 
    description: 'Share confessions, doubts, or opinions without revealing your identity.', 
    color: '#ec4899' 
  }, 
  { 
    icon: BarChart3, 
    title: 'Polls & Reactions', 
    description: 'Create polls, react with emotions, start conversations that go beyond likes.', 
    color: '#10b981' 
  }, 
  { 
    icon: BookOpen, 
    title: 'Study Resources', 
    description: 'Verified notes, PYQs, formula sheets — uploaded by seniors, free forever.', 
    color: '#ef4444' 
  } 
]

export default function Features() {
  const gridRef = useRef(null)

  useGSAP(() => {
    if (!shouldAnimate()) return

    const cards = gridRef.current?.querySelectorAll('.feature-card')
    if (!cards) return

    gsap.fromTo(cards, 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'power2.out', 
        scrollTrigger: { 
          trigger: gridRef.current, 
          start: 'top 85%', 
          once: true 
        } 
      } 
    )
  }, [])

  return (
    <section id="features" className="py-32 px-4 bg-[#0f0f0f] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Everything for <br className="md:hidden" /> 
            <span className="text-white/40">campus life</span>
          </h2>
          <p className="text-white/50 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Built for students, by a student. A unified platform to navigate your college journey.
          </p>
        </div>

        {/* Features grid */}
        <div 
          ref={gridRef} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {FEATURES.map((feature, i) => (
            <div 
              key={i} 
              className="feature-card group relative p-8 rounded-[2rem] border border-white/5 bg-[#141414] 
                         transition-all duration-500 hover:bg-[#1a1a1a] hover:border-white/10 hover:-translate-y-2 overflow-hidden"
            >
              {/* Inner glow effect */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: feature.color }}
              />

              <div className="relative z-10 space-y-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
                  style={{ backgroundColor: feature.color + '15', color: feature.color }}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-base leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Bottom line indicator */}
              <div 
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
                style={{ backgroundColor: feature.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
