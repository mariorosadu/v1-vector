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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.vekthos.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'VECTÖR | Decision Intelligence',
    template: '%s | VECTÖR',
  },
  description: 'We prime human cognition to unlock artificial intelligence\'s full potential.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'VECTÖR | Decision Intelligence',
    description: 'We prime human cognition to unlock artificial intelligence\'s full potential.',
    siteName: 'VECTÖR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VECTÖR | Decision Intelligence',
    description: 'We prime human cognition to unlock artificial intelligence\'s full potential.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
