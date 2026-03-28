'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journal', label: 'Journal' },
  { href: '/settings', label: 'Settings' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            pathname.startsWith(item.href)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
