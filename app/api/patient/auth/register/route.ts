import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, phone, dateOfBirth, gender, address, profileImage } = body;

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, password, and phone are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: email.toLowerCase() });
    if (existingPatient) {
      return NextResponse.json(
        { success: false, message: 'Patient with this email already exists' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingPhone = await Patient.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const patient = await Patient.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      profileImage,
    });

    // Remove password from response
    const patientResponse = patient.toObject();
    delete patientResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: 'Patient registered successfully',
        data: patientResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error registering patient',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

