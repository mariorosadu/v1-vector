import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.vekthos.com/box',
  },
}

export default function BoxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
