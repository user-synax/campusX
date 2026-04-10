"use client"

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Logo from "@/components/shared/Logo"

export default function Error({ error, reset }) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console OR an external service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-[#f0f0f0] overflow-hidden relative">
      {/* Branding Header */}
      <header className="absolute top-0 w-full p-6 flex justify-center z-20">
        <Logo size="lg" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        {/* Error Icon */}
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 relative">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping" />
        </div>

        <div className="space-y-4 max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight text-white line-clamp-1">
            Something went wrong
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-sm justify-center">
          <Button 
            onClick={() => reset()}
            size="lg" 
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 shadow-xl shadow-primary/20 gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </Button>
          <Button 
            onClick={() => router.push('/')}
            variant="ghost" 
            size="lg" 
            className="rounded-full border border-white/10 hover:bg-white/5 h-14 px-8 gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
        </div>

        {/* Debug info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl max-w-md w-full">
            <p className="text-xs font-mono text-red-400 text-left break-all">
              <strong>Error Trace:</strong> {error.message || 'No message provided'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
