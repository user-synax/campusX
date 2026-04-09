"use client"

import dynamic from 'next/dynamic'

// Dynamically import the client-only Hero with no SSR
const Hero = dynamic(() => import('./Hero'), { ssr: false })

export default function HeroClient() {
  return <Hero />
}
