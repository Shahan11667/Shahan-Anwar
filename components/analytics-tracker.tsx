'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem('_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_sid', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function getToolInfoFromPath(path: string): { toolSlug?: string; toolName?: string } {
  const toolNames: Record<string, string> = {
    'jpg-to-pdf': 'JPG to PDF',
    'pdf-to-jpg': 'PDF to JPG',
    'merge-pdf': 'Merge PDF',
    'split-pdf': 'Split PDF',
    'image-compressor': 'Image Compressor',
    'image-resizer': 'Image Resizer',
    'jpg-to-png': 'JPG to PNG',
    'word-counter': 'Word Counter',
    'case-converter': 'Case Converter',
    'json-formatter': 'JSON Formatter',
    'base64-tool': 'Base64 Encoder/Decoder',
    'image-to-text': 'Image to Text OCR',
    'pdf-to-text': 'PDF to Text',
    'voice-message-to-text': 'Voice to Text',
  };

  const toolsMatch = path.match(/^\/tools\/([^/]+)/);
  if (toolsMatch) {
    const slug = toolsMatch[1];
    return { toolSlug: slug, toolName: toolNames[slug] || slug };
  }

  if (path.startsWith('/video-downloader')) {
    return { toolSlug: 'video-downloader', toolName: 'Video Downloader' };
  }
  if (path.startsWith('/video-editor')) {
    return { toolSlug: 'video-editor', toolName: 'Video Editor' };
  }

  return {};
}

async function trackPageView(path: string) {
  try {
    const sessionId = getOrCreateSessionId();
    const { toolSlug, toolName } = getToolInfoFromPath(path);
    const isTool = !!toolSlug;

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: isTool ? 'tool_use' : 'page_view',
        page: path,
        toolSlug,
        toolName,
        sessionId,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      }),
    });
  } catch {
    // analytics is non-critical — silently ignore failures
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== prevPath.current) {
      prevPath.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
