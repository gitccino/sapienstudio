import {
  AiImageIcon,
  GiftIcon,
  Refresh01Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from './ui/button'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { fireConfetti } from '@/lib/confetti'

type CreditDailyProps = {
  userBalance: number
}

export default function CreditDaily({ userBalance }: CreditDailyProps) {
  const claimDailyReward = useMutation(api.functions.credits.claimDailyReward)
  const refreshLastClaimDate = useMutation(
    api.functions.credits.refreshLastClaimDate,
  )

  const { canClaim } = useQuery(api.functions.credits.getDailyClaimStatus) ?? {
    canClaim: false,
  }

  const [isPending, setIsPending] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleClaimDailyReward = async () => {
    if (isPending) return
    setIsPending(true)
    setFeedback(null) // clear previous feedback

    try {
      const result = await claimDailyReward()
      // claimDailyReward returns structured { success, message, newBalance }
      if (result.success) {
        setFeedback({ type: 'success', message: result.message })
        fireConfetti()
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    } catch (error) {
      // Catch unexpected thrown network or Auth errors
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      setFeedback({ type: 'error', message: errorMessage })
      console.error('Failed to claim daily reward:', error)
    } finally {
      setIsPending(false)
    }
  }

  const handleRefreshLastClaimDate = async () => {
    if (isPending) return
    setIsPending(true)
    setFeedback(null)
    try {
      await refreshLastClaimDate()
    } catch (error) {
      console.error('Failed to refresh last claim date:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-1">
      <Button
        variant="ghost"
        size="none"
        className="flex-row-start text-background bg-reward h-10 w-full gap-2 rounded-lg px-3 font-semibold"
        onClick={handleClaimDailyReward}
        disabled={isPending || !canClaim}
      >
        <HugeiconsIcon icon={AiImageIcon} className="size-5" strokeWidth={2} />
        <span>{canClaim ? 'Claim Daily Reward' : 'Already Claimed'}</span>
      </Button>

      {/* Conditionally render feedback or the default hint text */}
      {feedback ? (
        <span
          className={`px-1 text-xs font-medium ${
            feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {feedback.message}
        </span>
      ) : (
        <span className="text-muted-foreground px-1 text-[.65rem]">
          ** Check back daily to claim free credit
        </span>
      )}
      {/* {!canClaim && (
        <Button
          variant="ghost"
          size="none"
          className="flex-row-start bg-card-background h-10 w-full gap-3 rounded-lg px-3 font-medium"
          onClick={handleRefreshLastClaimDate}
          disabled={isPending}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            className="size-4"
            strokeWidth={2}
          />
          <span>Refresh Daily Reward</span>
        </Button>
      )} */}
    </div>
  )
}
