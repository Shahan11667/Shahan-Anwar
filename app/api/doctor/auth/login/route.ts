import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email: email.toLowerCase() })
      .populate('specialties', 'name description icon');

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if doctor is active
    if (!doctor.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is disabled. Please contact admin.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: doctor._id.toString(),
      email: doctor.email,
      role: 'doctor',
    });

    // Prepare doctor data without password
    const doctorData = doctor.toObject();
    delete doctorData.password;

    // Return success response with token
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          token,
          doctor: doctorData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing login',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

