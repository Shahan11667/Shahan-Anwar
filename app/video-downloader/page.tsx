import { Metadata } from 'next';
import VideoDownloaderClient from '@/components/video-downloader-client';

const siteUrl = 'https://shahananwar.vercel.app';
const toolUrl = `${siteUrl}/video-downloader`;

export const metadata: Metadata = {
  title: 'Free Online Video Downloader - YouTube, Facebook & Instagram',
  description:
    'Download videos from YouTube, Facebook, Instagram, TikTok, and 1000+ sites for free in HD quality. Paste any video URL and download instantly — no software, no registration needed.',
  keywords: [
    'video downloader',
    'youtube video downloader',
    'download youtube video free',
    'facebook video downloader',
    'instagram video downloader',
    'online video downloader free',
    'hd video downloader',
    'download video from link',
    'youtube to mp4',
    'save video online',
    'tiktok video downloader',
    'twitter video downloader',
  ],
  alternates: {
    canonical: toolUrl,
  },
  openGraph: {
    title: 'Free Online Video Downloader - YouTube, Facebook & Instagram',
    description:
      'Download videos from YouTube, Facebook, Instagram and 1000+ sites for free. HD quality, no registration, instant download.',
    url: toolUrl,
    type: 'website',
    siteName: 'Shahan Free Online Tools',
    images: [
      {
        url: 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Online Video Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Video Downloader - YouTube, Facebook & Instagram',
    description:
      'Download YouTube, Facebook, and Instagram videos for free. HD quality, instant download.',
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

export default function VideoDownloaderPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Online Video Downloader',
    url: toolUrl,
    description:
      'Download videos from YouTube, Facebook, Instagram, and 1000+ supported websites for free in HD quality.',
    applicationCategory: 'UtilitiesApplication',
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
    name: 'How to download a video online for free',
    description:
      'Download any video from YouTube, Facebook, Instagram, or TikTok using this free online video downloader.',
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Copy the video URL',
        text: 'Go to YouTube, Facebook, or Instagram and copy the URL of the video from your browser address bar.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Paste the URL into the downloader',
        text: 'Paste the copied video URL into the input field on this page and click "Fetch Video".',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download the video in HD',
        text: 'Click "Download Now" to save the video in high definition quality directly to your device.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which sites does this video downloader support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This video downloader supports YouTube, Facebook, Instagram, Twitter/X, TikTok, Vimeo, Dailymotion, and 1000+ other video platforms.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this video downloader free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, this online video downloader is completely free. No registration, no subscription, and no software installation is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download YouTube videos in HD quality?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can download YouTube videos in HD quality. Simply paste the YouTube video URL and click Download Now.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it safe to use this online video downloader?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, completely safe. We do not store your videos and the download happens directly between you and the video platform.',
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
      { '@type': 'ListItem', position: 3, name: 'Video Downloader', item: toolUrl },
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
      <VideoDownloaderClient />
    </>
  );
}
