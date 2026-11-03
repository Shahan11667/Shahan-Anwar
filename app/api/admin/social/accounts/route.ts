import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialAccount from '@/models/SocialAccount';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const accounts = await SocialAccount.find({}).lean();
    
    // Default account placeholders if none exist
    const platforms = ['youtube', 'instagram', 'tiktok', 'facebook'];
    const formatted = platforms.map(p => {
      const existing = accounts.find((a: any) => a.platform === p);
      if (existing) {
        return {
          platform: existing.platform,
          accountHandle: existing.accountHandle,
          accountName: existing.accountName,
          channelId: existing.channelId,
          avatarUrl: existing.avatarUrl,
          isConnected: existing.isConnected,
          hasToken: Boolean(existing.accessToken),
          updatedAt: existing.updatedAt
        };
      }
      return {
        platform: p,
        accountHandle: p === 'youtube' ? '@BeshaanVibe' : p === 'instagram' ? '@beshaan_vibe' : '@beshaan',
        accountName: p === 'youtube' ? 'Beshaan Official' : 'Beshaan Trio',
        isConnected: false,
        hasToken: false
      };
    });

    return NextResponse.json({ success: true, accounts: formatted });
  } catch (error: any) {
    // Graceful offline fallback
    return NextResponse.json({
      success: true,
      offline: true,
      accounts: [
        { platform: 'youtube', accountHandle: '@BeshaanVibe', accountName: 'Beshaan (YouTube)', isConnected: false },
        { platform: 'instagram', accountHandle: '@beshaan_vibe', accountName: 'Beshaan (Instagram)', isConnected: false },
        { platform: 'tiktok', accountHandle: '@beshaan', accountName: 'Beshaan (TikTok)', isConnected: false },
        { platform: 'facebook', accountHandle: '@beshaan', accountName: 'Beshaan (Facebook)', isConnected: false }
      ]
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { platform, accountHandle, accountName, accessToken, refreshToken, channelId } = body;

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform is required' }, { status: 400 });
    }

    const updated = await SocialAccount.findOneAndUpdate(
      { platform },
      {
        platform,
        accountHandle: accountHandle || (platform === 'youtube' ? '@BeshaanVibe' : '@beshaan'),
        accountName: accountName || 'Beshaan',
        channelId: channelId || '',
        accessToken: accessToken || '',
        refreshToken: refreshToken || '',
        isConnected: Boolean(accessToken || accountHandle),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${platform} account (${updated.accountHandle})!`,
      account: {
        platform: updated.platform,
        accountHandle: updated.accountHandle,
        accountName: updated.accountName,
        isConnected: updated.isConnected
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform is required' }, { status: 400 });
    }

    await SocialAccount.findOneAndUpdate(
      { platform },
      {
        isConnected: false,
        accessToken: '',
        refreshToken: ''
      }
    );

    return NextResponse.json({
      success: true,
      message: `Disconnected ${platform} account.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

