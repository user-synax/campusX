"use client"

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        {process.env.NODE_ENV === 'development' 
          ? error.message 
          : "An unexpected error occurred. Our team has been notified."}
      </p>
      <div className="flex gap-4 mt-8">
        <Button 
          variant="default" 
          onClick={() => reset()}
          className="rounded-full gap-2 px-6"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/feed'}
          className="rounded-full px-6"
        >
          Go Home
        </Button>
      </div>
    </div>
  )
}
