import { AiImageIcon, GiftIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from './ui/button'

type CreditDailyProps = {
  userBalance: number
}

export default function CreditDaily({ userBalance }: CreditDailyProps) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <Button
        variant="ghost"
        size="none"
        className="bt flex-row-start text-background bg-reward h-10 w-full gap-2 rounded-lg px-3 font-semibold"
      >
        <HugeiconsIcon icon={AiImageIcon} className="size-5" strokeWidth={2} />
        <span>Claim Daily Reward</span>
      </Button>
      <span className="text-muted-foreground px-1 text-[.65rem]">
        ** Check back daily to claim free credit
      </span>
    </div>
  )
}
