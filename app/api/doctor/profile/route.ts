import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get doctor's own profile
export async function GET(request: NextRequest) {
  try {
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

    const doctor = await Doctor.findById(decoded.userId)
      .select('-password')
      .populate('specialties', 'name description icon');

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile fetched successfully',
        data: doctor,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

