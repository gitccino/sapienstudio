import { Button } from '@/components/ui/button'
import { ColorCategory } from '@/types'
import { PencilEdit01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback } from 'react'
// import { useEffect, useState } from 'react'

const SWATCH_SIZE = 8 * 4

type ColorPickerProps = {
  hexValue: string
  category: ColorCategory
  label: string
  onChangeAction: (
    color: string,
    opacity: number,
    category: ColorCategory,
  ) => void
}

export function ColorPicker({
  hexValue,
  category,
  label,
  onChangeAction,
}: ColorPickerProps) {
  // const isEyedropperSupported =
  //   (typeof window !== 'undefined' && 'EyeDropper' in window)
  const isEyedropperSupported = false

  const handleNativeColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      onChangeAction(hex, 100, category)
    },
    [onChangeAction, category],
  )

  return (
    <div className="flex flex-row items-center justify-start gap-2 px-1.5 md:px-6">
      {isEyedropperSupported ? (
        <div
          className="border-border box-content flex items-center justify-center rounded-sm border-0"
          style={{
            backgroundColor: hexValue,
            height: SWATCH_SIZE,
            width: SWATCH_SIZE,
          }}
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={PencilEdit01Icon}
            className="size-4 text-white mix-blend-difference"
          />
        </div>
      ) : (
        <label
          className="border-border box-content flex cursor-pointer items-center justify-center rounded-sm border-0"
          aria-label="Open color picker"
          style={{
            backgroundColor: hexValue,
            height: SWATCH_SIZE,
            width: SWATCH_SIZE,
          }}
        >
          <input
            type="color"
            value={hexValue}
            onChange={handleNativeColorChange}
            className="sr-only absolute h-0 w-0 opacity-0"
          />
          <HugeiconsIcon
            icon={PencilEdit01Icon}
            strokeWidth={2}
            className="size-4 text-white mix-blend-multiply"
          />
        </label>
      )}
      <div className="flex flex-row items-center justify-start gap-1 font-medium">
        <span className="text-base font-medium">{label}</span>
        <span className="text-foreground/50 text-[0.6rem]">{hexValue}</span>
      </div>
    </div>
  )
}
