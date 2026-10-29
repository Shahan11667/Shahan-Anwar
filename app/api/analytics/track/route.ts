import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (!ua) return 'unknown';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(ua: string): string {
  if (!ua) return 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return 'Other';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, page, toolSlug, toolName, action, sessionId, referrer } = body;

    if (!eventType || !page || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || undefined;
    const city = req.headers.get('x-vercel-ip-city') || undefined;

    await connectDB();

    await ActivityLog.create({
      eventType,
      page,
      toolSlug: toolSlug || undefined,
      toolName: toolName || undefined,
      action: action || undefined,
      sessionId,
      userAgent,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      country,
      city,
      referrer: referrer || undefined,
      timestamp: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
