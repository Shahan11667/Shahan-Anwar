import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import Appointment from '@/models/Appointment';
import Session from '@/models/Session';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// PUT - Patient cancels their own appointment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Verify patient token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'patient') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { cancelReason } = body;

    // Check if appointment exists and belongs to this patient
    const appointment = await Appointment.findOne({
      _id: params.id,
      patient: decoded.userId,
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if appointment is already cancelled or completed
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Appointment is already cancelled' },
        { status: 400 }
      );
    }

    if (appointment.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel completed appointment' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    appointment.status = 'cancelled';
    if (cancelReason) {
      appointment.cancelReason = cancelReason;
    }
    await appointment.save();

    // Decrement booked appointments count in session
    await Session.findByIdAndUpdate(appointment.session, {
      $inc: { bookedAppointments: -1 },
    });

    // Populate appointment data
    await appointment.populate('doctor', 'name email degree profileImage phone');
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
        message: 'Appointment cancelled successfully',
        data: appointment,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error cancelling appointment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

