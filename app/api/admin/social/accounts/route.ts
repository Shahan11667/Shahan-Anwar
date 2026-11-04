import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialAccount from '@/models/SocialAccount';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const accounts = await SocialAccount.find({}).lean();
    
    // Only report what is really stored. An account counts as connected only when a token was saved.
    const platforms = ['youtube', 'instagram', 'tiktok', 'facebook'];
    const formatted = platforms.map(p => {
      const existing: any = accounts.find((a: any) => a.platform === p);
      const hasToken = Boolean(existing?.accessToken);
      return {
        platform: p,
        accountHandle: existing?.accountHandle || '',
        accountName: existing?.accountName || '',
        channelId: existing?.channelId,
        avatarUrl: existing?.avatarUrl,
        isConnected: Boolean(existing?.isConnected && hasToken),
        hasToken,
        updatedAt: existing?.updatedAt
      };
    });

    return NextResponse.json({ success: true, accounts: formatted });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      offline: true,
      accounts: ['youtube', 'instagram', 'tiktok', 'facebook'].map(platform => ({
        platform, accountHandle: '', accountName: '', isConnected: false, hasToken: false
      }))
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
        accountHandle: accountHandle || '',
        accountName: accountName || '',
        channelId: channelId || '',
        accessToken: accessToken || '',
        refreshToken: refreshToken || '',
        isConnected: Boolean(accessToken),
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

