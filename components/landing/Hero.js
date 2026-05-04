"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

      <motion.div 
        className="max-w-5xl mx-auto text-center space-y-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Exclusive for College Students and learners
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] text-white">
            Connect with your <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #8b5cf6, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Campus.
            </span>
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed font-medium"
          variants={itemVariants}
        >
          Join a thriving community of students. Share updates, <br className="hidden md:block" />
          discover events, and find resources that matter to you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full bg-white text-black hover:bg-white/90 hover:bg-linear-to-l hover:cursor-pointer transition-all shadow-xl shadow-white/5">
              Join CampusZen Now
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full border-white/10 hover:cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
              Explore Features
            </Button>
          </a>
        </motion.div>

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
      </motion.div>
    </section>
  )
}
