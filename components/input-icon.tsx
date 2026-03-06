import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { HugeiconsIcon, HugeiconsIconProps } from '@hugeicons/react'

function InputIcon({
  className,
  type,
  placeholder,
  icon,
  ...inputProps
}: React.ComponentProps<'input'> & HugeiconsIconProps) {
  return (
    <div className="relative w-full">
      <Input
        type={type}
        placeholder={placeholder}
        className={cn('pr-12', className)}
        {...inputProps}
      />
      <HugeiconsIcon
        icon={icon}
        size={16}
        strokeWidth={2}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20"
      />
    </div>
  )
}

export { InputIcon }
