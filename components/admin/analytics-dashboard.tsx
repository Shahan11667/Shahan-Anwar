'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye, Users, Wrench, Globe, Monitor, Smartphone, Tablet,
  TrendingUp, RefreshCw, Clock,
} from 'lucide-react';

interface StatsData {
  totalViews: number;
  uniqueSessions: number;
  topPages: { page: string; views: number }[];
  topTools: { slug: string; name: string; uses: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  recentActivity: {
    eventType: string;
    page: string;
    toolName?: string;
    device: string;
    browser: string;
    country?: string;
    timestamp: string;
  }[];
  dailyViews: { date: string; views: number }[];
  period: number;
}

const PERIODS = [7, 14, 30, 90];

function DeviceIcon({ device }: { device: string }) {
  if (device === 'mobile') return <Smartphone className="w-4 h-4 text-rose-400" />;
  if (device === 'tablet') return <Tablet className="w-4 h-4 text-amber-400" />;
  return <Monitor className="w-4 h-4 text-blue-400" />;
}

function Bar({ value, max, color = 'bg-rose-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function formatPage(page: string): string {
  if (page === '/') return 'Home';
  return page.replace(/^\/tools\//, 'Tool: ').replace(/^\//, '');
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics/stats?days=${period}`);
      if (res.status === 401) {
        setError('Unauthorized — please log in to admin.');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to load analytics. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">{error}</div>
    );
  }

  if (!data) return null;

  const maxPageViews = data.topPages[0]?.views || 1;
  const maxToolUses = data.topTools[0]?.uses || 1;
  const maxDevice = data.deviceBreakdown[0]?.count || 1;
  const maxBrowser = data.browserBreakdown[0]?.count || 1;
  const maxCountry = data.countryBreakdown[0]?.count || 1;

  const maxDaily = Math.max(...data.dailyViews.map((d) => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Activity Analytics</h2>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p}d
            </button>
          ))}
          <button
            onClick={fetchStats}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-slate-400">Page Views</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.totalViews.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Last {data.period} days</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Unique Sessions</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.uniqueSessions.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Distinct visitors</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Top Tool</span>
            </div>
            <div className="text-lg font-bold text-white truncate">
              {data.topTools[0]?.name || '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {data.topTools[0]?.uses ?? 0} uses
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Top Country</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.countryBreakdown[0]?.country || '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {data.countryBreakdown[0]?.count ?? 0} visits
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily chart */}
      {data.dailyViews.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Daily Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {data.dailyViews.map((d) => {
                const h = Math.max(4, Math.round((d.views / maxDaily) * 96));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-rose-600/70 hover:bg-rose-500 rounded-sm transition-colors"
                      style={{ height: `${h}px` }}
                    />
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-slate-800 px-1 rounded">
                      {d.date}: {d.views}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-600">
              <span>{data.dailyViews[0]?.date}</span>
              <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-400" /> Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topPages.length === 0 && (
              <p className="text-xs text-slate-500">No data yet.</p>
            )}
            {data.topPages.map((p) => (
              <div key={p.page}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate max-w-[70%]">{formatPage(p.page)}</span>
                  <span className="text-slate-400 font-medium">{p.views}</span>
                </div>
                <Bar value={p.views} max={maxPageViews} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Tools */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" /> Most Used Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topTools.length === 0 && (
              <p className="text-xs text-slate-500">No tool usage recorded yet.</p>
            )}
            {data.topTools.map((t) => (
              <div key={t.slug}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate max-w-[70%]">{t.name || t.slug}</span>
                  <span className="text-slate-400 font-medium">{t.uses} uses</span>
                </div>
                <Bar value={t.uses} max={maxToolUses} color="bg-emerald-600" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Device + Browser */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" /> Devices & Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Devices</p>
              <div className="space-y-2">
                {data.deviceBreakdown.map((d) => (
                  <div key={d.device} className="flex items-center gap-2">
                    <DeviceIcon device={d.device} />
                    <span className="text-xs text-slate-300 w-16 capitalize">{d.device}</span>
                    <div className="flex-1">
                      <Bar value={d.count} max={maxDevice} color="bg-blue-600" />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Browsers</p>
              <div className="space-y-2">
                {data.browserBreakdown.map((b) => (
                  <div key={b.browser} className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 w-16 truncate">{b.browser}</span>
                    <div className="flex-1">
                      <Bar value={b.count} max={maxBrowser} color="bg-purple-600" />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.countryBreakdown.length === 0 && (
              <p className="text-xs text-slate-500">No country data available yet.</p>
            )}
            {data.countryBreakdown.map((c) => (
              <div key={c.country}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{c.country || 'Unknown'}</span>
                  <span className="text-slate-400 font-medium">{c.count}</span>
                </div>
                <Bar value={c.count} max={maxCountry} color="bg-amber-600" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 && (
            <p className="text-xs text-slate-500">No activity recorded yet.</p>
          )}
          <div className="space-y-1">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/60 last:border-0">
                <DeviceIcon device={a.device} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-300 truncate block">
                    {a.toolName ? `Used: ${a.toolName}` : formatPage(a.page)}
                  </span>
                  <span className="text-[10px] text-slate-500">{a.browser} · {a.country || 'Unknown'}</span>
                </div>
                <span className="text-[10px] text-slate-600 whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
