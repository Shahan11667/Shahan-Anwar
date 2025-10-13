import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import Doctor from '@/models/Doctor';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

// GET - Get all doctors with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const specialtyId = searchParams.get('specialty');
    const isActive = searchParams.get('isActive');
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    
    if (specialtyId) {
      query.specialties = specialtyId;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (isAvailable !== null) {
      query.isAvailableForAppointments = isAvailable === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch doctors with populated specialties
    const doctors = await Doctor.find(query)
      .select('-password') // Exclude password field
      .populate('specialties', 'name description icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        message: 'Doctors fetched successfully',
        data: doctors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching doctors',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new doctor (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      degree,
      specialties,
      profileImage,
      bio,
      experience,
      socialMedia,
    } = body;

    // Validation
    if (!name || !email || !password || !degree || !specialties || specialties.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, password, degree, and at least one specialty are required',
        },
        { status: 400 }
      );
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      degree,
      specialties,
      profileImage,
      bio,
      experience,
      socialMedia,
    });

    // Populate specialties before returning
    await doctor.populate('specialties', 'name description icon');

    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: 'Doctor created successfully',
        data: doctorResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating doctor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

