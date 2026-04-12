'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Login01Icon,
  Settings03Icon,
  SunriseIcon,
  SunsetIcon,
  TransactionHistoryIcon,
} from '@hugeicons/core-free-icons'
import { CreditDisplay, Splitter } from '@/components/credit-display'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCallback, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth-server'

export function NavigationBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  // This subscription now lives in the layout — it persists across route changes
  const userBalance = useQuery(api.functions.credits.getBalance)
  const isSignedIn = userBalance !== null
  const { theme, setTheme } = useThemeStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const handleSignOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <div className="flex h-12 w-full justify-end gap-2">
      {!isSignedIn && (
        <Link
          href="/register"
          className="flex-row-start bg-card-background text-foreground mr-auto gap-2 rounded-xl px-3 font-semibold"
        >
          <HugeiconsIcon
            icon={Login01Icon}
            className="size-5"
            strokeWidth={2}
          />
          <span>Sign in</span>
        </Link>
      )}

      {pathname !== '/collections' && (
        <Button
          type="button"
          variant="ghost"
          size="none"
          className="bg-card-background mr-auto h-12 cursor-pointer rounded-xl pr-4 pl-3 text-base"
          onClick={() => router.back()}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className={`size-5`}
            strokeWidth={2}
          />
          <span>{isPending ? 'Loading...' : 'Back'}</span>
        </Button>
      )}
      {userBalance && <CreditDisplay {...{ userBalance }} />}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="none"
            className="text-foreground bg-card-background size-12 cursor-pointer rounded-xl"
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={Settings03Icon}
              className="size-5"
            />
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="border-border bg-card-background w-[92%] gap-2 rounded-2xl md:w-100"
        >
          <DialogHeader>
            <DialogTitle className="mb-4 font-semibold">
              User Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex-col-start gap-2">
            <span className="text-muted-foreground mr-auto px-1 text-sm font-medium">
              Preferences
            </span>
            <Button
              variant="ghost"
              size="opticalCenter"
              onClick={handleToggleTheme}
              className="flex-row-start bg-card-background-lv2 h-12 w-full gap-4 rounded-md px-4 text-base font-medium"
            >
              {theme === 'dark' ? (
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={SunriseIcon}
                  className="text-muted-foreground size-5"
                />
              ) : (
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={SunsetIcon}
                  className="text-muted-foreground size-5"
                />
              )}
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
          </div>
          {isSignedIn && (
            <>
              <div className="flex-col-start gap-2">
                <span className="text-muted-foreground mr-auto px-1 text-sm font-medium">
                  Transaction History
                </span>
                <Button
                  variant="ghost"
                  size="opticalCenter"
                  onClick={() =>
                    startTransition(() => router.push('/sapiens/history'))
                  }
                  className="flex-row-start bg-card-background-lv2 h-12 w-full gap-4 rounded-md px-4 text-base font-medium"
                  disabled={isPending}
                >
                  <HugeiconsIcon
                    icon={TransactionHistoryIcon}
                    className="text-muted-foreground size-5"
                    strokeWidth={2}
                  />
                  <span>Download History</span>
                </Button>
                <Button
                  variant="ghost"
                  size="opticalCenter"
                  onClick={() =>
                    startTransition(() => router.push('/sapiens/purchase'))
                  }
                  className="flex-row-start bg-card-background-lv2 h-12 w-full gap-4 rounded-md px-4 text-base font-medium"
                  disabled={isPending}
                >
                  <HugeiconsIcon
                    icon={TransactionHistoryIcon}
                    className="text-muted-foreground size-5"
                    strokeWidth={2}
                  />
                  <span>Purchase History</span>
                </Button>
              </div>

              <Splitter />
              <span className="text-muted-foreground pl-1 text-xs italic">
                Hope you enjoyed your experience here
              </span>
              <Button
                type="button"
                size="none"
                variant="ghost"
                onClick={handleSignOut}
                className="bg-destructive text-background dark:text-foreground h-12 w-full rounded-md px-3 text-base font-semibold"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
