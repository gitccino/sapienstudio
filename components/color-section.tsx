'use client'

import { memo } from 'react'

import { Button } from '@/components/ui/button'
import type { ColorCategory } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { ColorPicker } from '@/components/color-picker'

const colorVariants = {
  active: {
    opacity: 1,
    scale: 1.2,
    y: -1.6,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  inactive: {
    opacity: 1,
    scale: 1,
    y: 1.6,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
} as const

type ColorSectionProps = {
  category: ColorCategory
  label: string
  colorOptions: string[]
  value: string
  // onSelectColorAction: (
  //   color: string,
  //   opacity: number,
  //   category: ColorCategory,
  // ) => void
  onSelectColorAction: any
}

export const ColorSection = memo(function ColorSection({
  category,
  label,
  colorOptions,
  value,
  onSelectColorAction,
}: ColorSectionProps) {
  return (
    <div className="relative mx-auto flex w-full flex-col items-start justify-start gap-1">
      <ColorPicker
        hexValue={value}
        category={category}
        label={label}
        onChangeAction={onSelectColorAction}
      />
      <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden">
        <div className="grid w-full grid-cols-8 justify-items-center gap-1.5 px-0.5 py-1.5">
          <motion.div
            key={`${category}-transparent`}
            variants={colorVariants}
            animate={value === '#00000000' ? 'active' : 'inactive'}
          >
            <Button
              type="button"
              size="none"
              variant="ghost"
              onClick={() => onSelectColorAction('#000000', 0, category)}
              className={cn(
                'border-border h-fit overflow-hidden rounded-sm border-0',
              )}
            >
              <div
                className="aspect-square h-8 w-8 md:h-10 md:w-10"
                style={{
                  background:
                    'repeating-conic-gradient(#FFFEFE 0 25%, #E1E1E1 0 50%) 50% / 8px 8px',
                }}
              />
            </Button>
          </motion.div>

          {colorOptions.map((color, index) => (
            <motion.div
              key={`${category}-${color}`}
              variants={colorVariants}
              animate={value === color ? 'active' : 'inactive'}
            >
              <Button
                type="button"
                size="none"
                variant="ghost"
                onClick={() => onSelectColorAction(color, 100, category)}
                className={cn(
                  'border-border overflow-hidden rounded-sm border-0',
                )}
              >
                <div
                  className="aspect-square h-8 w-8 md:h-10 md:w-10"
                  style={{
                    backgroundColor: color,
                  }}
                ></div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
})
