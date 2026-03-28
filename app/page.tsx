import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center justify-center w-full max-w-md p-8 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Barakah
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Personal growth and reflection
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Button asChild size="lg" className="w-full">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
