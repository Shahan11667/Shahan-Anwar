import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import Specialty from '@/models/Specialty';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get all specialties
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const specialties = await Specialty.find(query).sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        message: 'Specialties fetched successfully',
        data: specialties,
        count: specialties.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching specialties',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new specialty (Admin only)
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
    const { name, description, icon } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Specialty name is required' },
        { status: 400 }
      );
    }

    // Check if specialty already exists
    const existingSpecialty = await Specialty.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingSpecialty) {
      return NextResponse.json(
        { success: false, message: 'Specialty already exists' },
        { status: 400 }
      );
    }

    // Create new specialty
    const specialty = await Specialty.create({
      name,
      description,
      icon,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Specialty created successfully',
        data: specialty,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

