import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get single session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await Session.findById(params.id)
      .populate('doctor', 'name email degree profileImage phone')
      .populate('specialty', 'name description icon')
      .populate('createdBy', 'name email');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Session fetched successfully',
        data: session,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching session',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update session (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      doctor,
      specialty,
      hospital,
      floor,
      room,
      date,
      startTime,
      endTime,
      description,
      images,
      maxAppointments,
      isActive,
    } = body;

    // Validate time format if provided
    if (startTime || endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if ((startTime && !timeRegex.test(startTime)) || (endTime && !timeRegex.test(endTime))) {
        return NextResponse.json(
          { success: false, message: 'Time must be in HH:mm format (e.g., 09:00)' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      doctor,
      specialty,
      hospital,
      floor,
      room,
      startTime,
      endTime,
      description,
      images,
      maxAppointments,
      isActive,
    };

    if (date) {
      updateData.date = new Date(date);
    }

    const session = await Session.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctor', 'name email degree profileImage phone')
      .populate('specialty', 'name description icon')
      .populate('createdBy', 'name email');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Session updated successfully',
        data: session,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating session',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete session (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const session = await Session.findByIdAndDelete(params.id);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Session deleted successfully',
        data: { id: params.id },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting session',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

