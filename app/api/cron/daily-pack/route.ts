import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyPack from '@/models/DailyPack';
import { generatePack, todayKey } from '@/lib/daily-pack';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Called once a day by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: NextRequest) {
  // CRON_SECRET (if set) must match; otherwise only Vercel's own cron caller is accepted.
  const secret = process.env.CRON_SECRET;
  const ok = secret
    ? req.headers.get('authorization') === `Bearer ${secret}`
    : (req.headers.get('user-agent') || '').startsWith('vercel-cron/');
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const existing = await DailyPack.findOne({ dateKey: todayKey(), source: 'cron' }).lean();
    if (existing) return NextResponse.json({ success: true, skipped: true, message: 'Today already has a pack' });
    const pack = await generatePack({ source: 'cron' });
    return NextResponse.json({ success: true, title: pack.title });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
