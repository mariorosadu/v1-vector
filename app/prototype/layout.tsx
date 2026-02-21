import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://vekthos.com/prototype',
  },
}

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
