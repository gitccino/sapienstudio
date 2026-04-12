import type { Metadata } from 'next'
import './globals.css'
import { ConvexClientProvider } from './ConvexClientProvider'
import type { Viewport } from 'next'
import { ThemeSync } from '@/components/theme-sync'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // This explicitly disables user-initiated zooming as well
}

export const metadata: Metadata = {
  title: 'Sapienstudio',
  description:
    'Creativity platform for creating and sharing your own characters',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/dtl8kfu.css" />
      </head>
      <body className={`no-scrollbar antialiased`}>
        <ThemeSync />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
