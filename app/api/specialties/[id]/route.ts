import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Specialty from '@/models/Specialty';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get single specialty by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const specialty = await Specialty.findById(params.id);

    if (!specialty) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Specialty fetched successfully',
        data: specialty,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update specialty (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, icon, isActive } = body;

    const specialty = await Specialty.findByIdAndUpdate(
      params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );

    if (!specialty) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Specialty updated successfully',
        data: specialty,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete specialty (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const specialty = await Specialty.findByIdAndDelete(params.id);

    if (!specialty) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Specialty deleted successfully',
        data: specialty,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

