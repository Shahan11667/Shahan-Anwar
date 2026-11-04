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
  // "pad": produce the final 9:16 (or 16:9) H.264 MP4 DURING the upload, so the link is complete before Buffer reads it
  const V = 'c_pad,w_1080,h_1920,b_black,vc_h264,ac_aac,f_mp4';
  const L = 'c_pad,w_1920,h_1080,b_black,vc_h264,ac_aac,f_mp4';
  const pad = body?.pad === 'vertical' ? V : body?.pad === 'horizontal' ? L : body?.pad === 'both' ? `${V}|${L}` : '';
  if (pad) params.eager = pad;
  else if (convert) params.eager = 'f_mp4,vc_h264,ac_aac';
  const signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);
  return NextResponse.json({
    success: true,
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    signature,
    params,
  });
}
