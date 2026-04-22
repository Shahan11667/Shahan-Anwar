import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  // Resolve the absolute path to the binary to avoid issues in the Next.js environment
  const ytdlpPath = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
  
  // Create a custom instance with the absolute path
  const youtubedlCustom = require('yt-dlp-exec').create(ytdlpPath);

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // We use dump-json to get the download URL and metadata
    const output = await youtubedlCustom(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      referer: url
    });

    return NextResponse.json({
      success: true,
      title: output.title,
      thumbnail: output.thumbnail,
      duration: output.duration,
      uploader: output.uploader,
      formats: output.formats
        .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none') // Filter for combined formats
        .map((f: any) => ({
          formatId: f.format_id,
          extension: f.ext,
          resolution: f.resolution || `${f.width}x${f.height}`,
          filesize: f.filesize || f.filesize_approx,
          url: f.url
        }))
        .reverse()
    });
  } catch (error: any) {
    console.error('yt-dlp error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch video info', 
      details: error.message 
    }, { status: 500 });
  }
}
