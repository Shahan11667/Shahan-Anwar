import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { guardStudio } from '@/lib/studio-guard';

// Returns a signed upload ticket so the browser can upload the rendered video straight to Cloudinary
// (Vercel functions cannot receive large request bodies).
export async function POST(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ success: false, error: 'Cloudinary env vars are missing.' }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  const convert = Boolean(body?.convertToMp4);
  const params: Record<string, string | number> = {
    timestamp: Math.round(Date.now() / 1000),
    folder: 'ai-video-studio',
  };
  if (convert) params.eager = 'f_mp4,vc_h264,ac_aac';
  const signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);
  return NextResponse.json({
    success: true,
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    signature,
    params,
  });
}
