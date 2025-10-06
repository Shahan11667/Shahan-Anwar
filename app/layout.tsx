import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shahan Anwar - Full Stack Developer | Next.js Expert | Mobile App Developer',
  description: 'Shahan Anwar is a skilled Full Stack Developer specializing in Next.js, React, TypeScript, and mobile app development. Explore my portfolio showcasing web applications, mobile apps, and innovative projects.',
  keywords: [
    'Shahan Anwar',
    'Shahan',
    'Full Stack Developer',
    'Web Developer',
    'Next.js Developer',
    'React Developer',
    'TypeScript Developer',
    'Mobile App Developer',
    'JavaScript Developer',
    'Node.js Developer',
    'MongoDB Developer',
    'Portfolio',
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'UI/UX Developer',
    'Freelance Developer',
    'Remote Developer',
    'Pakistan Developer',
    'Karachi Developer'
  ],
  authors: [{ name: 'Shahan Anwar' }],
  creator: 'Shahan Anwar',
  publisher: 'Shahan Anwar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shahananwar.vercel.app',
    title: 'Shahan Anwar - Full Stack Developer | Next.js Expert',
    description: 'Professional Full Stack Developer specializing in Next.js, React, TypeScript, and mobile app development. View my portfolio and get in touch for your next project.',
    siteName: 'Shahan Anwar Portfolio',
    images: [
      {
        url: 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shahan Anwar - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shahan Anwar - Full Stack Developer | Next.js Expert',
    description: 'Professional Full Stack Developer specializing in Next.js, React, TypeScript, and mobile app development.',
    creator: '@shahananwar',
    images: ['https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg'],
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
  alternates: {
    canonical: 'https://shahananwar.vercel.app',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
