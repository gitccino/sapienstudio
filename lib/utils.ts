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

export const getSecurePreviewUrl = (
  assetPath: string,
  width = 150,
  height = 150,
) => {
  const imageRequest = {
    bucket: 'sapienstudio',
    key: assetPath,
    edits: {
      resize: {
        width,
        height,
        fit: 'cover',
      },
      toFormat: 'webp',
      // SIH-specific: fetches watermark from S3 and composites it server-side
      overlayWith: {
        bucket: 'sapienstudio',
        key: 'watermark-150.png',
        wRatio: '100p', // scale to 100% of base image width
        hRatio: '100p',
        alpha: 50, // 0 = opaque, 100 = fully transparent
        options: {
          gravity: 'center',
        },
      },
    },
  }
  const encodedRequest = Buffer.from(JSON.stringify(imageRequest)).toString(
    'base64',
  )
  return `https://${process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME}/${encodedRequest}`
}
