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
    default: 'VEKTHÖS | Decision Intelligence, Cognitive AI Governance & LLMOps | Americas',
    template: '%s | VEKTHÖS',
  },
  description: 'VEKTHÖS delivers enterprise Decision Intelligence through Cognitive AI Governance and LLMOps solutions. We prime human cognition to unlock artificial intelligence\'s full potential across the Americas.',
  keywords: ['Decision Intelligence', 'Cognitive AI Governance', 'LLMOps', 'AI Governance', 'Enterprise AI', 'Artificial Intelligence', 'AI Solutions', 'VEKTHÖS', 'Americas', 'Machine Learning Operations', 'AI Strategy', 'Cognitive Computing', 'AI Implementation', 'AI Consulting'],
  authors: [{ name: 'VEKTHÖS' }],
  creator: 'VEKTHÖS',
  publisher: 'VEKTHÖS',
  generator: 'v0.app',
  applicationName: 'VEKTHÖS',
  referrer: 'origin-when-cross-origin',
  category: 'Technology',
  classification: 'Decision Intelligence & AI Governance',
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
    title: 'VEKTHÖS | Decision Intelligence, Cognitive AI Governance & LLMOps | Americas',
    description: 'VEKTHÖS delivers enterprise Decision Intelligence through Cognitive AI Governance and LLMOps solutions. We prime human cognition to unlock artificial intelligence\'s full potential across the Americas.',
    siteName: 'VEKTHÖS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VEKTHÖS - Decision Intelligence & AI Governance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEKTHÖS | Decision Intelligence, Cognitive AI Governance & LLMOps | Americas',
    description: 'VEKTHÖS delivers enterprise Decision Intelligence through Cognitive AI Governance and LLMOps solutions. We prime human cognition to unlock artificial intelligence\'s full potential across the Americas.',
    images: ['/og-image.png'],
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
  verification: {
    google: 'google-site-verification-code',
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
