'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music2, BarChart3, Info, Zap } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', icon: Music2 },
  { href: '/analyze', label: 'Analyze', icon: Zap },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/about', label: 'About', icon: Info },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-syn-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-syn flex items-center justify-center">
                <Music2 className="w-4 h-4 text-white" />
              </div>
              {/* Equalizer bars */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-end gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                {[1,2,3].map(i => (
                  <div key={i} className="eq-bar w-[3px]" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gradient-text">Synesthesia</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-syn-accent/20 text-syn-accent border border-syn-accent/30'
                      : 'text-syn-muted hover:text-syn-text hover:bg-syn-surface'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* CTA */}
          <Link
            href="/analyze"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-syn text-white hover:opacity-90 transition-opacity shadow-lg shadow-syn-accent/20"
          >
            Try Now
          </Link>
        </div>
      </div>
    </nav>
  )
}
