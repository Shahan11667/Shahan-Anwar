import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'video.mp4';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity;q=1, *;q=0',
        'Range': 'bytes=0-'
      }
    });
    
    if (!response.ok && response.status !== 206) {
        throw new Error(`Failed to fetch video: ${response.statusText} (${response.status})`);
    }

    // Pass along headers but force attachment
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    // If the source server provided a length, pass it along so the browser shows a progress bar
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
        headers.set('Content-Length', contentLength);
    }

    return new NextResponse(response.body, { headers });
  } catch (error: any) {
    console.error('[Stream Error]:', error.message);
    return NextResponse.json({ error: 'Failed to stream video. The link might have expired.' }, { status: 500 });
  }
}
