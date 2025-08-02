import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Copy Ready - AI Ad Copy Platform',
    template: '%s | Copy Ready'
  },
  description: 'Create high-converting ad copy with AI-powered agents. Generate compelling content for Facebook, Google, Email, and more.',
  keywords: ['ad copy', 'AI marketing', 'copywriting', 'advertising', 'content generation', 'social media ads', 'PPC'],
  authors: [{ name: 'Copy Ready Team' }],
  creator: 'Copy Ready',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Copy Ready - AI Ad Copy Platform',
    description: 'Create high-converting ad copy with AI-powered agents. Generate compelling content for Facebook, Google, Email, and more.',
    siteName: 'Copy Ready',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Copy Ready - AI Ad Copy Platform',
    description: 'Create high-converting ad copy with AI-powered agents. Generate compelling content for Facebook, Google, Email, and more.',
    creator: '@copyready',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#393E46" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased overflow-hidden" suppressHydrationWarning>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}