import { Metadata } from 'next';
import VideoEditorClient from '@/components/video-editor-client';

const siteUrl = 'https://www.shahananwar.tech';
const toolUrl = `${siteUrl}/video-editor`;

export const metadata: Metadata = {
  title: 'Free Online Video Converter & Trimmer - Convert to 9:16 for Shorts & Reels',
  description:
    'Convert any video to 9:16 aspect ratio for YouTube Shorts, Instagram Reels, and TikTok. Also trim and cut video clips online for free — no software or registration needed.',
  keywords: [
    'video converter online',
    'convert video to 9:16',
    'youtube shorts converter',
    'instagram reels converter',
    'tiktok video converter',
    'video trimmer online free',
    'cut video online',
    'trim video online free',
    'mp4 converter online',
    'video editor online free',
    'compress video online',
    'vertical video converter',
  ],
  alternates: {
    canonical: toolUrl,
  },
  openGraph: {
    title: 'Free Online Video Converter & Trimmer - YouTube Shorts & Reels',
    description:
      'Convert videos to 9:16 for YouTube Shorts, Instagram Reels, and TikTok. Trim and cut video clips online. Free, fast, no registration.',
    url: toolUrl,
    type: 'website',
    siteName: 'Shahan Free Online Tools',
    images: [
      {
        url: 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Online Video Converter and Trimmer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Video Converter & Trimmer - YouTube Shorts & Reels',
    description:
      'Convert videos to 9:16 for YouTube Shorts, Instagram Reels, and TikTok. Free online video editor.',
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

export default function VideoEditorPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Online Video Converter & Trimmer',
    url: toolUrl,
    description:
      'Convert any video to 9:16 aspect ratio for YouTube Shorts, Instagram Reels, and TikTok. Trim and cut video clips online for free.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to convert a video to 9:16 for YouTube Shorts online',
    description:
      'Convert any video to vertical 9:16 aspect ratio for YouTube Shorts, Instagram Reels, and TikTok using this free online tool.',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload your video',
        text: 'Click the upload area or drag and drop your MP4, MOV, or AVI video file (max 500MB).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Convert or Trim',
        text: 'Select "Convert to 9:16" to reformat for Shorts/Reels, or select "Trim / Cut Video" to cut out a specific segment.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download your video',
        text: 'Click the action button and download your converted or trimmed video file.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I convert a video for YouTube Shorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your video and click "Convert to 9:16". This reformats your video to vertical 720x1280 resolution, the correct format for YouTube Shorts, Instagram Reels, and TikTok.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this video trimmer completely free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, this online video trimmer and converter is completely free. No registration, no subscription, and no watermarks on your video.',
        },
      },
      {
        '@type': 'Question',
        name: 'What video formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can upload MP4, MOV, AVI, and most common video formats up to 500MB in size.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I trim a video online without software?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Use the "Trim / Cut Video" tab to select exact start and end points and download the trimmed clip, all without installing any software.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/tools` },
      { '@type': 'ListItem', position: 3, name: 'Video Editor', item: toolUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VideoEditorClient />
    </>
  );
}
