import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyPack from '@/models/DailyPack';
import { guardStudio } from '@/lib/studio-guard';
import { generatePack } from '@/lib/daily-pack';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  try {
    await connectDB();
    const packs = await DailyPack.find({}).sort({ createdAt: -1 }).limit(30).lean();
    return NextResponse.json({ success: true, packs: JSON.parse(JSON.stringify(packs)) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const pack = await generatePack({ source: 'manual', hint: typeof body?.hint === 'string' ? body.hint.slice(0, 500) : undefined });
    return NextResponse.json({ success: true, pack });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id, status } = await req.json();
    await DailyPack.findByIdAndUpdate(id, { status: status === 'used' ? 'used' : 'new' });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get('id');
    if (id) await DailyPack.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
