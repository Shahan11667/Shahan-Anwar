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
import WordToPdfTool from '@/components/tools/word-to-pdf-tool';
import PdfToWordTool from '@/components/tools/pdf-to-word-tool';
import PdfEditorTool from '@/components/tools/pdf-editor-tool';
import WordEditorTool from '@/components/tools/word-editor-tool';
import ImageEditorTool from '@/components/tools/image-editor-tool';
import ScreenshotStudioTool from '@/components/tools/screenshot-studio-tool';
import ResumeBuilderTool from '@/components/tools/resume-builder-tool';
import InvoiceGeneratorTool from '@/components/tools/invoice-generator-tool';
import SmartCalculatorTool from '@/components/tools/smart-calculator-tool';
import DevTextConverterTool from '@/components/tools/dev-text-converter-tool';
import FocusHabitTrackerTool from '@/components/tools/focus-habit-tracker-tool';
import MusicStudioTool from '@/components/tools/music-studio-tool';
import InteriorPlannerTool from '@/components/tools/interior-planner-tool';
import PdfSuiteTool from '@/components/tools/pdf-suite-tool';
import OrganizePdfTool from '@/components/tools/organize-pdf-tool';
import CompressPdfTool from '@/components/tools/compress-pdf-tool';
import ConvertToPdfSuiteTool from '@/components/tools/convert-to-pdf-suite-tool';
import ConvertFromPdfSuiteTool from '@/components/tools/convert-from-pdf-suite-tool';
import PdfAnnotateTool from '@/components/tools/pdf-annotate-tool';
import PdfSecurityTool from '@/components/tools/pdf-security-tool';
import PdfIntelligenceTool from '@/components/tools/pdf-intelligence-tool';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

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
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'pdf-editor':
        return <PdfEditorTool />;
      case 'word-editor':
        return <WordEditorTool />;
      case 'image-editor':
        return <ImageEditorTool />;
      case 'screenshot-studio':
        return <ScreenshotStudioTool />;
      case 'resume-builder':
        return <ResumeBuilderTool />;
      case 'invoice-generator':
        return <InvoiceGeneratorTool />;
      case 'smart-calculator':
        return <SmartCalculatorTool />;
      case 'dev-text-converter':
        return <DevTextConverterTool />;
      case 'focus-habit-tracker':
        return <FocusHabitTrackerTool />;
      case 'music-studio':
        return <MusicStudioTool />;
      case 'interior-planner':
        return <InteriorPlannerTool />;
      case 'pdf-suite':
        return <PdfSuiteTool />;
      case 'organize-pdf':
        return <OrganizePdfTool />;
      case 'compress-pdf':
        return <CompressPdfTool />;
      case 'convert-to-pdf':
        return <ConvertToPdfSuiteTool />;
      case 'convert-from-pdf':
        return <ConvertFromPdfSuiteTool />;
      case 'pdf-annotate':
        return <PdfAnnotateTool />;
      case 'pdf-security':
        return <PdfSecurityTool />;
      case 'pdf-intelligence':
        return <PdfIntelligenceTool />;
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
