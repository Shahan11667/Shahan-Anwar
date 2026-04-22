import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const format = request.nextUrl.searchParams.get('format') || 'best';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Set headers for download
  const headers = new Headers();
  headers.set('Content-Type', 'video/mp4');
  headers.set('Content-Disposition', `attachment; filename="video.mp4"`);

  // Use absolute path for Windows environment
  const ytdlpPath = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
  
  const processChild = spawn(ytdlpPath, [
    url,
    '-f', format,
    '-o', '-', 
    '--no-playlist',
  ]);

  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      processChild.stdout.on('data', (chunk) => {
        if (!isClosed) {
          controller.enqueue(chunk);
        }
      });
      processChild.stdout.on('end', () => {
        if (!isClosed) {
          isClosed = true;
          controller.close();
        }
      });
      processChild.stdout.on('error', (err) => {
        if (!isClosed) {
          isClosed = true;
          controller.error(err);
        }
      });
      processChild.on('close', (code) => {
        if (!isClosed) {
          isClosed = true;
          if (code === 0) controller.close();
          else controller.error(new Error(`Exit code ${code}`));
        }
      });
    },
    cancel() {
      isClosed = true;
      processChild.kill();
    }
  });

  return new NextResponse(stream, { headers });
}
