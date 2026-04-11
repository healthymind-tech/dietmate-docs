import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
