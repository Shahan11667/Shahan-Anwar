import React from 'react';
import { Metadata } from 'next';
import ToolsHubView from '@/components/tools-hub-view';
import { ALL_TOOLS_LIST } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Tools - PDF, Image, OCR, Audio & Developer Utilities',
  description:
    'Free high-performance online tools suite. Convert PDF to JPG, compress images, extract text with AI OCR, format JSON, and transcribe voice notes with 100% in-browser privacy.',
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
    'online utilities',
    'private online converters'
  ],
  alternates: {
    canonical: 'https://www.shahananwar.tech',
  },
  openGraph: {
    title: 'Free Online Tools - PDF, Image, OCR, Audio & Developer Utilities',
    description:
      'Free high-performance online tools suite. 100% private in-browser conversions with zero server uploads.',
    url: 'https://www.shahananwar.tech',
    siteName: 'Shahan Free Online Tools',
    type: 'website',
  },
};

export default function Home() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shahan Free Online Tools',
    url: 'https://www.shahananwar.tech',
    description:
      '16+ free in-browser productivity utilities including PDF converters, image tools, AI OCR, and code formatters.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.shahananwar.tech/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Online Tools Hub',
    description:
      'Collection of 16+ client-side productivity utilities including PDF converters, image tools, AI OCR, and code formatters.',
    url: 'https://www.shahananwar.tech',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ALL_TOOLS_LIST.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.title,
        url: `https://www.shahananwar.tech/tools/${tool.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <ToolsHubView />
    </>
  );
}
