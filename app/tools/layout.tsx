import React from 'react';
import { Metadata } from 'next';
import { ALL_TOOLS_LIST } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Tools - PDF, Image, OCR, Audio & Developer Utilities',
  description:
    'Explore 16+ free, fast, and 100% in-browser productivity tools. Convert PDF to JPG, compress images, extract text with AI OCR, format JSON, and transcribe voice notes with zero server uploads.',
  keywords: [
    'free online tools',
    'pdf to jpg converter',
    'jpg to pdf',
    'image compressor online',
    'word counter free',
    'json formatter',
    'image to text ocr',
    'voice message to text',
    'split pdf online',
    'merge pdf free',
    'developer utilities',
    'private online converters'
  ],
  alternates: {
    canonical: 'https://shahananwar.vercel.app/tools',
  },
  openGraph: {
    title: 'Free Online Tools - PDF, Image, OCR, Audio & Developer Utilities',
    description:
      'Explore 16+ free, fast, and 100% in-browser productivity tools. 100% private, zero server uploads.',
    url: 'https://shahananwar.vercel.app/tools',
    siteName: 'Shahan Free Online Tools',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Tools - PDF, Image, OCR, Audio & Developer Utilities',
    description:
      'Explore 16+ free, fast, and 100% in-browser productivity tools. 100% private, zero server uploads.',
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
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Online Tools Hub',
    description:
      'Collection of 16+ client-side productivity utilities including PDF converters, image tools, AI OCR, and code formatters.',
    url: 'https://shahananwar.vercel.app/tools',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ALL_TOOLS_LIST.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.title,
        url: `https://shahananwar.vercel.app/tools/${tool.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}
