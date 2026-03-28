'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Nav } from './nav'
import { logout } from '@/actions/auth'

interface HeaderProps {
  user: {
    email: string
    display_name: string
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-lg">
            Barakah
          </Link>
          <Nav />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="default" className="gap-2">
              <User className="size-4" />
              <span className="hidden sm:inline">{user.display_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.display_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/account">
                <Settings className="mr-2 size-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
