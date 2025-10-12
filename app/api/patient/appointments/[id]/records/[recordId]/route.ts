import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get single medical record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
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

    // Verify record belongs to patient
    const record = await MedicalRecord.findOne({
      _id: params.recordId,
      appointment: params.id,
      patient: decoded.userId,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Medical record not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Medical record fetched successfully',
        data: record,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching medical record',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update medical record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
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

    // Verify record belongs to patient
    const record = await MedicalRecord.findOne({
      _id: params.recordId,
      appointment: params.id,
      patient: decoded.userId,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Medical record not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, fileUrl, textContent, notes, fileSize, mimeType } = body;

    // Update record
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      params.recordId,
      { title, description, fileUrl, textContent, notes, fileSize, mimeType },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Medical record updated successfully',
        data: updatedRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating medical record',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete medical record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
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

    // Verify record belongs to patient
    const record = await MedicalRecord.findOne({
      _id: params.recordId,
      appointment: params.id,
      patient: decoded.userId,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Medical record not found or access denied' },
        { status: 404 }
      );
    }

    await MedicalRecord.findByIdAndDelete(params.recordId);

    return NextResponse.json(
      {
        success: true,
        message: 'Medical record deleted successfully',
        data: { id: params.recordId },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting medical record',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

