import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-border bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#f0f0f0]">CampusZen</span>
            <span className="text-xs bg-[#1a1a1a] px-2 py-0.5 rounded-full text-muted-foreground border border-border">
              Beta
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            The social network built exclusively for Indian college students.
            Connect, discover, grow.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ by a student, for students.
          </p>
        </div>

        {/* Platform links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-[#f0f0f0]">Platform</h4>
          {[
            { label: 'Feed', href: '/feed' },
            { label: 'Communities', href: '/community' },
            { label: 'Events', href: '/events' },
            { label: 'Resources', href: '/resources' }
          ].map(link => (
            <Link key={link.label} href={link.href}
              className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/markdown"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            AI Documentation
          </Link>
        </div>

        {/* Legal links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-[#f0f0f0]">Legal</h4>
          <Link href="/terms"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            Privacy Policy
          </Link>
          <a href="mailto:usersynax@gmail.com"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            Contact Support
          </a>
        </div>

        {/* Auth links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-[#f0f0f0]">Get Started</h4>
          <Link href="/signup"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            Sign Up Free
          </Link>
          <Link href="/login"
            className="block text-sm text-muted-foreground hover:text-[#f0f0f0] transition-colors">
            Log In
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          © {new Date().getFullYear()} CampusZen. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Made in India 🇮🇳
        </p>
      </div>
    </footer>
  )
}
