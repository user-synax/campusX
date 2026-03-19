import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="text-8xl font-black text-muted-foreground/10 mb-4 select-none">404</div>
      
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      
      <Button asChild className="mt-8 rounded-full px-8">
        <Link href="/feed">
          Go Home
        </Link>
      </Button>
    </div>
  )
}
