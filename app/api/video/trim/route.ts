import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Trimming video: ${file.name}`);
    console.log(`Start: ${startTime}s, End: ${endTime}s`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary first
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'video-editor-temp',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    console.log('Uploaded to Cloudinary:', uploadResult.public_id);

    // Generate trimmed video URL using Cloudinary transformations
    const duration = parseFloat(endTime) - parseFloat(startTime);
    
    const trimmedUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'video',
      transformation: [
        {
          start_offset: parseFloat(startTime),
          end_offset: parseFloat(endTime),
        }
      ],
      format: 'mp4',
      secure: true,
    });

    console.log('Trimmed URL:', trimmedUrl);

    // Download the trimmed video
    const videoResponse = await fetch(trimmedUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Cloudinary trim failed: ${videoResponse.status}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    console.log(`Trimmed video size: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Clean up - delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' });
      console.log('Cleaned up Cloudinary file');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.[^/.]+$/, '');

    return new NextResponse(Buffer.from(videoBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${sanitizedName}_trimmed.mp4"`,
        'Content-Length': videoBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Video trim error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trim video',
        details: error.message,
      },
      { status: 500 }
    );
  }
}


