import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: {
    default: 'KIP Platform — Identity & Authentication',
    template: '%s | KIP Platform',
  },
  description:
    'Production-ready Identity Management & Authentication Platform. Multi-tenant, SSO, MFA, passkeys, and more.',
  keywords: ['authentication', 'identity management', 'SSO', 'MFA', 'OAuth', 'multi-tenant'],
  authors: [{ name: 'KIP Platform' }],
  openGraph: {
    type: 'website',
    title: 'KIP Platform — Identity & Authentication',
    description: 'Production-ready Identity Management & Authentication for modern SaaS.',
    siteName: 'KIP Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KIP Platform',
    description: 'Production-ready Identity Management & Authentication',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
