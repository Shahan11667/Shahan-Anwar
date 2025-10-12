import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Doctor views medical records for their appointment
export async function GET(
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

    // Verify appointment belongs to doctor
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

    // Get all medical records for this appointment
    const records = await MedicalRecord.find({ appointment: params.id })
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: 'Medical records fetched successfully',
        data: records,
        count: records.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching medical records',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

