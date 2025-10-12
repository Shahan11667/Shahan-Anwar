import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get all medical records for an appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verify appointment belongs to patient
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

    // Get all medical records for this appointment
    const records = await MedicalRecord.find({ appointment: params.id })
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

// POST - Add medical record to appointment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verify appointment belongs to patient
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

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed' && appointment.status !== 'completed') {
      return NextResponse.json(
        { success: false, message: 'Can only add records to confirmed or completed appointments' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, title, description, fileUrl, textContent, notes, fileSize, mimeType } = body;

    // Validation
    if (!type || !title) {
      return NextResponse.json(
        { success: false, message: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['image', 'video', 'pdf', 'document', 'note', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid record type' },
        { status: 400 }
      );
    }

    // For file types, fileUrl is required
    if (type !== 'note' && !fileUrl && !textContent) {
      return NextResponse.json(
        { success: false, message: 'File URL or text content is required for this record type' },
        { status: 400 }
      );
    }

    // Create medical record
    const record = await MedicalRecord.create({
      appointment: params.id,
      patient: decoded.userId,
      doctor: appointment.doctor,
      type,
      title,
      description,
      fileUrl,
      textContent,
      notes,
      fileSize,
      mimeType,
      uploadedBy: 'patient',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Medical record added successfully',
        data: record,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error adding medical record',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

