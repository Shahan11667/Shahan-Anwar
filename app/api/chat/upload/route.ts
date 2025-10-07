import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || '');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Chat file upload: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Determine resource type based on MIME type
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    let messageType: 'image' | 'video' | 'document' = 'document';
    
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
      messageType = 'image';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
      messageType = 'video';
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `chat-media/${messageType}s`,
          public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    console.log('File uploaded to Cloudinary:', result.secure_url);

    return NextResponse.json({
      success: true,
      data: {
        fileUrl: result.secure_url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        messageType: messageType,
        publicId: result.public_id,
      }
    });
  } catch (error: any) {
    console.error('Chat file upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

