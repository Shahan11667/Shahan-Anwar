import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ status: 'error', text: 'A valid video URL is required' }, { status: 400 });
    }

    const cleanUrl = url.trim();
    console.log(`[Downloader Engine] Processing URL: ${cleanUrl}`);

    // Engine 1: Local Built-in yt-dlp Engine (Fast, Reliable, Zero External Server Dependency)
    const ytdlpPath = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
    const ytdlpExists = fs.existsSync(ytdlpPath);

    if (ytdlpExists) {
      try {
        console.log(`[Downloader Engine] Executing local yt-dlp binary with node js-runtime...`);
        const { stdout } = await execFileAsync(
          ytdlpPath,
          [
            '--js-runtimes', 'node',
            '--dump-single-json',
            '--no-warnings',
            '--no-check-certificates',
            '--prefer-free-formats',
            cleanUrl
          ],
          { maxBuffer: 20 * 1024 * 1024, timeout: 25000 }
        );

        if (stdout && stdout.trim()) {
          const data = JSON.parse(stdout);
          const formats = data.formats || [];
          const picker: Array<{ type: 'video' | 'audio'; url: string; text: string }> = [];

          // 1. Combined formats (contains both video and audio track)
          const combined = formats.filter(
            (f: any) => f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none'
          );

          for (const c of combined) {
            const res = c.resolution || (c.height ? `${c.height}p` : 'Video');
            const ext = c.ext || 'mp4';
            picker.push({
              type: 'video',
              url: c.url,
              text: `${res} (${ext})`
            });
          }

          // 2. High-res video formats (if combined are limited, provide 720p/1080p video)
          const videoOnly = formats.filter(
            (f: any) => f.url && f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none')
          );
          const seenHeights = new Set(combined.map((c: any) => c.height).filter(Boolean));

          for (const v of videoOnly.reverse()) {
            const h = v.height;
            if (h && [1080, 720, 480].includes(h) && !seenHeights.has(h)) {
              seenHeights.add(h);
              picker.push({
                type: 'video',
                url: v.url,
                text: `${h}p HD (${v.ext || 'mp4'})`
              });
            }
          }

          // 3. Audio formats
          const audioOnly = formats.filter(
            (f: any) => f.url && (!f.vcodec || f.vcodec === 'none') && f.acodec && f.acodec !== 'none'
          );

          if (audioOnly.length > 0) {
            // Pick highest bitrate audio
            const bestAudio = audioOnly[audioOnly.length - 1];
            picker.push({
              type: 'audio',
              url: bestAudio.url,
              text: `Audio HQ - ${bestAudio.ext || 'm4a'} (${bestAudio.abr ? Math.round(bestAudio.abr) + ' kbps' : 'Best Quality'})`
            });

            if (audioOnly.length > 1) {
              const secondAudio = audioOnly[0];
              picker.push({
                type: 'audio',
                url: secondAudio.url,
                text: `Audio Standard - ${secondAudio.ext || 'mp3'}`
              });
            }
          }

          // If picker has items, return them
          if (picker.length > 0) {
            return NextResponse.json({
              status: 'picker',
              text: data.title || 'Video Ready to Download',
              picker: picker
            });
          }

          // If single direct URL available
          if (data.url) {
            return NextResponse.json({
              status: 'redirect',
              text: data.title || 'Video Ready',
              url: data.url
            });
          }
        }
      } catch (err: any) {
        console.warn(`[Downloader Engine] yt-dlp execution error:`, err.message);
      }
    }

    // Engine 2: Public Backup API Nodes (if yt-dlp fails or unsupported platform)
    const fallbackEngines = [
      'https://co.wuk.sh/api/json',
      'https://nachos.imput.net',
      'https://api.cobalt.tools/api/json'
    ];

    for (const engine of fallbackEngines) {
      try {
        const response = await fetch(engine, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl, vQuality: '720' }),
          signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData && (resData.url || resData.picker)) {
            return NextResponse.json(resData);
          }
        }
      } catch (e) {
        // Continue to next engine
      }
    }

    return NextResponse.json({
      status: 'error',
      text: 'Unable to extract video links. The video might be private, geo-blocked, or requires login credentials.'
    }, { status: 400 });

  } catch (error: any) {
    console.error(`[Downloader Engine Error]:`, error);
    return NextResponse.json({
      status: 'error',
      text: 'Download service error: ' + (error.message || 'Unknown error occurred')
    }, { status: 500 });
  }
}
