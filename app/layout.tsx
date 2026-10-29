import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import AnalyticsTracker from '@/components/analytics-tracker'

const inter = Inter({ subsets: ['latin'] })

import connectDB from '@/lib/mongodb'
import Hero from '@/models/Hero'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = 'https://shahananwar.vercel.app';
  const defaultKeywords = [
    'Shahan Anwar',
    'Full Stack Developer',
    'Next.js Developer',
    'Free Online Tools',
    'JPG to PDF Converter',
    'PDF to JPG Online',
    'Image Compressor',
    'Image Resizer',
    'JSON Formatter',
    'Word Counter',
    'Image to Text OCR',
    'Voice Message to Text',
    'Merge PDF',
    'Split PDF',
  ];

  try {
    await connectDB()
    const hero = await Hero.findOne({ isActive: true })

    if (hero) {
      const dynamicTitle = `${hero.name} | ${hero.title} & Free Online Tools`
      const dynamicDesc = hero.seoDescription || hero.description || 'Full stack developer portfolio and free high-performance online productivity tools suite.'
      
      return {
        metadataBase: new URL(baseUrl),
        title: {
          default: dynamicTitle,
          template: '%s | Shahan Anwar',
        },
        description: dynamicDesc,
        keywords: hero.seoKeywords && hero.seoKeywords.length > 0 
          ? [...hero.seoKeywords, ...defaultKeywords] 
          : defaultKeywords,
        authors: [{ name: hero.name }],
        creator: hero.name,
        publisher: hero.name,
        alternates: {
          canonical: baseUrl,
        },
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: baseUrl,
          title: dynamicTitle,
          description: dynamicDesc,
          siteName: `${hero.name} Portfolio & Tools`,
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
    metadataBase: new URL(baseUrl),
    title: 'Shahan Anwar | Full Stack Developer & Free Online Tools',
    description: 'Explore full stack web engineering projects and free high-speed productivity utilities: PDF to JPG, Image Compressor, JSON Formatter, and OCR.',
    keywords: defaultKeywords,
    alternates: {
      canonical: baseUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
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
          <AnalyticsTracker />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
