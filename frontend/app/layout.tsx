'use client'

import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <title>AgentOps Platform</title>
        <meta name="description" content="Multi-Agent Evaluation, Telemetry & Optimization System" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-surface-50 font-sans">
        {children}
      </body>
    </html>
  )
}
