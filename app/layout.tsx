import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

import connectDB from '@/lib/mongodb'
import Hero from '@/models/Hero'

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB()
    const hero = await Hero.findOne({ isActive: true })

    if (hero) {
      const dynamicTitle = `${hero.name} | ${hero.title}`
      const dynamicDesc = hero.seoDescription || hero.description
      
      return {
        title: dynamicTitle,
        description: dynamicDesc,
        keywords: hero.seoKeywords && hero.seoKeywords.length > 0 
          ? hero.seoKeywords 
          : ['Portfolio', 'Developer', hero.name],
        authors: [{ name: hero.name }],
        creator: hero.name,
        publisher: hero.name,
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: 'https://shahananwar.vercel.app',
          title: dynamicTitle,
          description: dynamicDesc,
          siteName: `${hero.name} Portfolio`,
          images: [
            {
              url: hero.image || 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg',
              width: 1200,
              height: 630,
              alt: dynamicTitle,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: dynamicTitle,
          description: dynamicDesc,
          images: [hero.image || 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg'],
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
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Fallback
  return {
    title: 'Portfolio',
    description: 'Welcome to my portfolio.',
  }
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
