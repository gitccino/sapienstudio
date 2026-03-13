'use client'

import { Preloaded, useAction, usePreloadedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { HugeiconsIcon } from '@hugeicons/react'
import { AiImageIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { CreditGift } from './credit-gift'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useCallback, memo } from 'react'
import { Button } from './ui/button'
import { CREDIT_OPTIONS } from '@/constants/billing'
import { fireConfetti } from '@/lib/confetti'
import CreditDaily from '@/components/credit-daily'

// ⚡ Lazy Load Non-Critical UI: Modals are perfect for deferring component load
// const CreditDaily = dynamic(() => import('@/components/credit-daily'), {
//   loading: () => (
//     <div className="bg-card-background h-24 w-full animate-pulse rounded-lg" />
//   ),
// })

// const CREDIT_OPTIONS = [
//   { credit: 5, price: 1 },
//   { credit: 20, price: 3 },
//   { credit: 40, price: 5 },
// ].map((option, id) => ({ id, ...option }))

// ⚡ Shift Burden to the Server: Next.js + Convex preloaded queries handles data hydration effortlessly
export function CreditDisplay({
  preloadedBalance,
  className,
}: React.ComponentProps<'div'> & {
  preloadedBalance: Preloaded<typeof api.functions.credits.getBalance>
}) {
  // This hook takes the instant server data, but subscribes to WebSocket updates!
  const balance = usePreloadedQuery(preloadedBalance)

  return (
    <div className={cn('', className)}>
      <Dialog>
        <DialogTrigger className="flex-row-start bg-card-background h-full gap-2 rounded-xl px-3">
          <HugeiconsIcon
            icon={Wallet01Icon}
            strokeWidth={2}
            className="size-5"
          />
          <div className="flex-row-center gap-1 pb-0.5 text-base">
            <span className="font-semibold">
              {balance === -1
                ? 'Empty'
                : balance === 0
                  ? 'No credits'
                  : `${balance} credits`}
            </span>
          </div>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="w-[80%] rounded-2xl">
          <DialogHeader className="">
            <DialogTitle className="mb-4">Credits Wallet</DialogTitle>
            <div className="flex-row-start bg-card-background h-10 w-full gap-2 rounded-lg px-3 text-sm">
              <HugeiconsIcon
                icon={Wallet01Icon}
                strokeWidth={1.5}
                className="size-5"
              />
              <span className="font-semibold">
                {balance === -1
                  ? 'Empty Wallet'
                  : balance === 0
                    ? `No Credit`
                    : `${balance} Credits`}
              </span>
              {/* <CreditGift className="ml-auto" />
              <CreditGift amount={-1} /> */}
            </div>

            <BuyCreditsSection />

            <Splitter />
            <CreditDaily userBalance={balance} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ⚡ Colocate Your State: Moved state down so that CreditDisplay
// isn't forced to re-render when purely changing a UI selection.
const BuyCreditsSection = memo(function BuyCreditsSection() {
  const [selectedCreditOption, setSelectedCreditOption] = useState(
    CREDIT_OPTIONS[0],
  )
  const payWithStripe = useAction(api.payments.stripe.createCheckoutSession)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const checkoutUrl = await payWithStripe({
        creditOptionId: selectedCreditOption.id,
      })
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <BuyCreditOptions
        selectedOption={selectedCreditOption}
        onSelect={setSelectedCreditOption}
      />
      <Button
        variant="ghost"
        size="opticalCenter"
        className="bg-foreground text-background font-semibold"
        disabled={isLoading}
        onClick={handleCheckout}
      >
        Buy {selectedCreditOption.credit} credits
      </Button>
    </>
  )
})

type BuyCreditOptionType = (typeof CREDIT_OPTIONS)[number]

type BuyCreditOptionsProps = {
  selectedOption: BuyCreditOptionType
  onSelect: (option: BuyCreditOptionType) => void
}

// ⚡ Master Memoization: Avoid re-rendering lists unnecessarily
const BuyCreditOptions = memo(function BuyCreditOptions({
  selectedOption,
  onSelect,
}: BuyCreditOptionsProps) {
  return (
    <div className="flex flex-row items-center justify-around gap-2">
      {CREDIT_OPTIONS.map((option) => (
        <BuyCreditOptionItem
          key={option.id}
          option={option}
          isSelected={selectedOption.id === option.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})

type BuyCreditOptionItemProps = {
  option: BuyCreditOptionType
  isSelected: boolean
  onSelect: (option: BuyCreditOptionType) => void
}

// ⚡ Optimize List Rendering: Extracting item components to maintain independent closure
// ⚡ Stabilize Prop References: `useCallback` secures function identity
const BuyCreditOptionItem = memo(function BuyCreditOptionItem({
  option,
  isSelected,
  onSelect,
}: BuyCreditOptionItemProps) {
  const { credit, price } = option

  const handleClick = useCallback(() => {
    onSelect(option)
  }, [onSelect, option])

  return (
    <div
      className={cn(
        'flex-col-start bg-card-background w-full cursor-pointer rounded-lg border-2 p-2 transition-colors',
        isSelected
          ? 'border-foreground/10'
          : 'border-card-background opacity-60 hover:opacity-100',
      )}
      onClick={handleClick}
    >
      <div className="flex-row-center text-reward gap-1 text-sm font-bold">
        <HugeiconsIcon icon={AiImageIcon} className="size-4" strokeWidth={2} />
        <span>{credit}</span>
      </div>
      <div className="flex-col-center">
        <span>${price}</span>
        <span className="text-muted-foreground text-[0.6rem] font-medium">
          ${price / credit} per credit
        </span>
      </div>
    </div>
  )
})

const Splitter = memo(function Splitter() {
  return <div className="bg-card-background mx-auto my-2 h-px w-[90%]"></div>
})
