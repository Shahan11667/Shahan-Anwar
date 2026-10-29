import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS_DATA, ALL_TOOLS_LIST } from '@/lib/tools-data';
import ToolLayout from '@/components/tools/tool-layout';

// Dynamic Tool Components
import JpgToPdfTool from '@/components/tools/jpg-to-pdf-tool';
import PdfToJpgTool from '@/components/tools/pdf-to-jpg-tool';
import MergePdfTool from '@/components/tools/merge-pdf-tool';
import SplitPdfTool from '@/components/tools/split-pdf-tool';
import ImageCompressorTool from '@/components/tools/image-compressor-tool';
import ImageResizerTool from '@/components/tools/image-resizer-tool';
import ImageConverterTool from '@/components/tools/image-converter-tool';
import WordCounterTool from '@/components/tools/word-counter-tool';
import CaseConverterTool from '@/components/tools/case-converter-tool';
import JsonFormatterTool from '@/components/tools/json-formatter-tool';
import Base64Tool from '@/components/tools/base64-tool';
import ImageToTextTool from '@/components/tools/image-to-text-tool';
import PdfToTextTool from '@/components/tools/pdf-to-text-tool';
import VoiceToTextTool from '@/components/tools/voice-to-text-tool';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ALL_TOOLS_LIST.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS_DATA[slug];

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const siteUrl = 'https://www.shahananwar.tech';
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: toolUrl,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: toolUrl,
      type: 'website',
      siteName: 'Shahan Free Online Tools',
      images: [
        {
          url: 'https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/og-image.jpg',
          width: 1200,
          height: 630,
          alt: tool.metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
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
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = TOOLS_DATA[slug];

  if (!tool) {
    notFound();
  }

  // Component Map
  const renderToolComponent = () => {
    switch (tool.slug) {
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'jpg-to-png':
        return <ImageConverterTool />;
      case 'word-counter':
        return <WordCounterTool />;
      case 'case-converter':
        return <CaseConverterTool />;
      case 'json-formatter':
        return <JsonFormatterTool />;
      case 'base64-tool':
        return <Base64Tool />;
      case 'image-to-text':
        return <ImageToTextTool />;
      case 'pdf-to-text':
        return <PdfToTextTool />;
      case 'voice-message-to-text':
        return <VoiceToTextTool />;
      default:
        return null;
    }
  };

  return (
    <ToolLayout tool={tool}>
      {renderToolComponent()}
    </ToolLayout>
  );
}
