import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-heading' });
const inter = Inter({ subsets: ["latin"], variable: '--font-body' });

export const viewport = {
  maximumScale: 1,
  interactiveWidget: 'resizes-content' as const,
}

export const metadata: Metadata = {
  title: 'VECTÖR | Decision Intelligence', 
  description: 'We prime human cognition to unlock artificial intelligence\'s full potential.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
