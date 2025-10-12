import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// PUT - Mark appointment as completed
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Verify doctor token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Doctor access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: params.id,
      doctor: decoded.userId,
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, message: 'Only confirmed appointments can be marked as completed' },
        { status: 400 }
      );
    }

    // Update status to completed
    appointment.status = 'completed';
    await appointment.save();

    // Populate appointment data
    await appointment.populate('patient', 'name email phone dateOfBirth gender address profileImage');
    await appointment.populate({
      path: 'session',
      populate: {
        path: 'specialty',
        select: 'name icon',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment marked as completed',
        data: appointment,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error completing appointment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

