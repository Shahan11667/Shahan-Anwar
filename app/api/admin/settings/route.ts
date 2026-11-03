import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import AdminSettings from '@/models/AdminSettings';

const DEFAULT_SETTINGS = {
  videoEditorEnabled: true,
  videoTrimEnabled: true,
  videoResizeEnabled: true,
  // Tools
  pdfEditorEnabled: true,
  wordToPdfEnabled: true,
  pdfToWordEnabled: true,
  wordEditorEnabled: true,
  imageEditorEnabled: true,
  screenshotStudioEnabled: true,
  resumeBuilderEnabled: true,
  invoiceGeneratorEnabled: true,
  nicheCalculatorsEnabled: true,
  dataConverterEnabled: true,
  focusTimerEnabled: true,
  musicStudioEnabled: true,
  interiorPlannerEnabled: true,
  // Complete PDF Suite Toggles
  pdfSuiteEnabled: true,
  organizePdfEnabled: true,
  compressPdfEnabled: true,
  convertToPdfEnabled: true,
  convertFromPdfEnabled: true,
  pdfAnnotateEnabled: true,
  pdfSecurityEnabled: true,
  pdfIntelligenceEnabled: true,
  // Specialist PDF Features
  pdfTextReflowEnabled: true,
  pdfBulkHighlightsEnabled: true,
  pdfAdvancedTypographyEnabled: true,
  pdfMultiObjectAlignmentEnabled: true,
  pdfReferenceManagerEnabled: true,
  pdfMindMapEnabled: true,
};

// GET - Fetch admin settings (public - for checking feature visibility)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get or create settings document
    let settings = await AdminSettings.findOne({});
    
    if (!settings) {
      settings = await AdminSettings.create(DEFAULT_SETTINGS);
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

    // Get or create settings document
    let settings = await AdminSettings.findOne({});
    
    if (!settings) {
      settings = await AdminSettings.create({
        ...DEFAULT_SETTINGS,
        ...body
      });
    } else {
      // Update all supplied fields
      Object.keys(body).forEach((key) => {
        if (typeof body[key] !== 'undefined') {
          (settings as any)[key] = body[key];
        }
      });
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
