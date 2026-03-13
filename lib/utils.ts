import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatReadableDate = (dateValue: number | string | Date) => {
  const date = new Date(dateValue)

  return date.toLocaleDateString('en-US', {
    weekday: 'short', // "Fri"
    month: 'short', // "Apr"
    day: 'numeric', // "11"
  })
}
