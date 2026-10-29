import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  // Simple admin auth check
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  if (!adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30', 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  await connectDB();

  const [
    totalViews,
    uniqueSessions,
    topPages,
    topTools,
    deviceBreakdown,
    browserBreakdown,
    countryBreakdown,
    recentActivity,
    dailyViews,
  ] = await Promise.all([
    // Total page views
    ActivityLog.countDocuments({ eventType: 'page_view', timestamp: { $gte: since } }),

    // Unique sessions
    ActivityLog.distinct('sessionId', { timestamp: { $gte: since } }).then((s) => s.length),

    // Top pages by views
    ActivityLog.aggregate([
      { $match: { eventType: 'page_view', timestamp: { $gte: since } } },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),

    // Top tools by usage
    ActivityLog.aggregate([
      { $match: { toolSlug: { $exists: true, $ne: null }, timestamp: { $gte: since } } },
      { $group: { _id: '$toolSlug', name: { $first: '$toolName' }, uses: { $sum: 1 } } },
      { $sort: { uses: -1 } },
      { $limit: 10 },
    ]),

    // Device breakdown
    ActivityLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Browser breakdown
    ActivityLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Country breakdown
    ActivityLog.aggregate([
      { $match: { country: { $exists: true, $ne: null }, timestamp: { $gte: since } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Recent activity (last 20 events)
    ActivityLog.find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean(),

    // Daily views for chart
    ActivityLog.aggregate([
      { $match: { eventType: 'page_view', timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return NextResponse.json({
    totalViews,
    uniqueSessions,
    topPages: topPages.map((p: any) => ({ page: p._id, views: p.views })),
    topTools: topTools.map((t: any) => ({ slug: t._id, name: t.name || t._id, uses: t.uses })),
    deviceBreakdown: deviceBreakdown.map((d: any) => ({ device: d._id, count: d.count })),
    browserBreakdown: browserBreakdown.map((b: any) => ({ browser: b._id, count: b.count })),
    countryBreakdown: countryBreakdown.map((c: any) => ({ country: c._id, count: c.count })),
    recentActivity,
    dailyViews: dailyViews.map((d: any) => ({ date: d._id, views: d.views })),
    period: days,
  });
}
