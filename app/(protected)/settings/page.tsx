import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Users, Shield } from 'lucide-react'

export const metadata = {
  title: 'Settings | Barakah',
}

const settingsCategories = [
  {
    title: 'Account',
    description: 'Manage your email and password',
    icon: User,
    href: '/settings/account',
  },
  {
    title: 'Partner',
    description: 'Link with your partner for shared features',
    icon: Users,
    href: '/settings/partner',
  },
  {
    title: 'Privacy',
    description: 'Control your data and privacy settings',
    icon: Shield,
    href: '/settings/privacy',
  },
]

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={category.href}>Manage</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
