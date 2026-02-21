import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://vekthos.com/publications',
  },
}

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
