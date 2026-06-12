import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'ShopDecide — India\'s Smartest Product Recommender',
  description:
    'AI-powered product recommendations from Amazon, Flipkart, Reddit & YouTube. Get expert BUY/WAIT/SKIP verdicts for any product.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body style={{ fontFamily: 'var(--font-nunito), sans-serif', background: '#fef9f0' }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
