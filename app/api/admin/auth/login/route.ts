import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
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

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is disabled. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
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
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    // Return success response with token
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
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

