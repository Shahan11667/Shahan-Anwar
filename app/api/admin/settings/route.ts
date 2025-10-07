import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';

// GET - Fetch admin settings (public - for checking feature visibility)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get or create settings document
    let settings = await AdminSettings.findOne({});
    
    if (!settings) {
      // Create default settings if none exist
      settings = await AdminSettings.create({
        videoEditorEnabled: true,
        videoTrimEnabled: true,
        videoResizeEnabled: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update admin settings (protected route - admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication using cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { videoEditorEnabled, videoTrimEnabled, videoResizeEnabled } = body;

    // Get or create settings document
    let settings = await AdminSettings.findOne({});
    
    if (!settings) {
      settings = await AdminSettings.create({
        videoEditorEnabled: videoEditorEnabled ?? true,
        videoTrimEnabled: videoTrimEnabled ?? true,
        videoResizeEnabled: videoResizeEnabled ?? true,
      });
    } else {
      // Update existing settings
      if (typeof videoEditorEnabled !== 'undefined') {
        settings.videoEditorEnabled = videoEditorEnabled;
      }
      if (typeof videoTrimEnabled !== 'undefined') {
        settings.videoTrimEnabled = videoTrimEnabled;
      }
      if (typeof videoResizeEnabled !== 'undefined') {
        settings.videoResizeEnabled = videoResizeEnabled;
      }
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

