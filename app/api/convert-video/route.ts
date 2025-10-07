import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Received file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Dynamic import of Transloadit
    const TransloaditModule = await import('transloadit');
    const Transloadit = TransloaditModule.default || TransloaditModule;
    const TransloaditClass = Transloadit.Transloadit || Transloadit;
    
    // Initialize Transloadit client
    const transloadit = new (TransloaditClass as any)({
      authKey: process.env.TRANSLOADIT_KEY,
      authSecret: process.env.TRANSLOADIT_SECRET,
    });

    // Write file to temp location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    tempFilePath = path.join(tmpdir(), `video_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
    
    await writeFile(tempFilePath, buffer);
    console.log('Temp file created:', tempFilePath);
    console.log('Starting Transloadit conversion...');

    // Create assembly
    const assembly = await transloadit.createAssembly({
      params: {
        steps: {
          ':original': {
            robot: '/upload/handle',
          },
          converted: {
            robot: '/video/encode',
            use: ':original',
            preset: 'ipad-high',
            width: 720,
            height: 1280,
            resize_strategy: 'fillcrop',
            turbo: false,
            result: true,
          },
        },
      },
      files: {
        file: tempFilePath,
      },
      waitForCompletion: true,
    });

    console.log('Conversion complete!');

    // Clean up temp file
    if (tempFilePath) {
      await unlink(tempFilePath);
    }

    const convertedVideo = assembly.results.converted?.[0];
    
    if (!convertedVideo || !convertedVideo.ssl_url) {
      throw new Error('Failed to get converted video');
    }

    console.log('Converted video URL:', convertedVideo.ssl_url);

    // Download converted video
    const videoResponse = await fetch(convertedVideo.ssl_url);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download: ${videoResponse.status}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    console.log(`Converted size: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Sanitize filename to avoid encoding issues
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.[^/.]+$/, '');

    return new NextResponse(Buffer.from(videoBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${sanitizedName}_9-16.mp4"`,
        'Content-Length': videoBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Conversion error:', error);

    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (e) {}
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to convert video',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '100mb',
  },
};

