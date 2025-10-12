import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';

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

    // Find patient by email
    const patient = await Patient.findOne({ email: email.toLowerCase() });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if patient is active
    if (!patient.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is disabled. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    
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
      userId: patient._id.toString(),
      email: patient.email,
      role: 'patient',
    });

    // Prepare patient data without password
    const patientData = patient.toObject();
    delete patientData.password;

    // Return success response with token
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          token,
          patient: patientData,
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

