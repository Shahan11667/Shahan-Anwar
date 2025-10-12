import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get all sessions with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctor');
    const specialtyId = searchParams.get('specialty');
    const hospital = searchParams.get('hospital');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (specialtyId) {
      query.specialty = specialtyId;
    }

    if (hospital) {
      query.hospital = { $regex: hospital, $options: 'i' };
    }

    if (date) {
      // Filter by specific date
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay,
      };
    } else if (startDate && endDate) {
      // Filter by date range
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch sessions with populated fields
    const sessions = await Session.find(query)
      .populate('doctor', 'name email degree profileImage')
      .populate('specialty', 'name icon')
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        message: 'Sessions fetched successfully',
        data: sessions,
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
        message: 'Error fetching sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new session (Admin only)
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
      doctor,
      specialty,
      hospital,
      floor,
      room,
      date,
      startTime,
      endTime,
      description,
      images,
      maxAppointments,
    } = body;

    // Validation
    if (!doctor || !specialty || !hospital || !floor || !room || !date || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Doctor, specialty, hospital, floor, room, date, startTime, and endTime are required',
        },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, message: 'Time must be in HH:mm format (e.g., 09:00)' },
        { status: 400 }
      );
    }

    // Check if session already exists for this doctor at this date/time
    const existingSession = await Session.findOne({
      doctor,
      date: new Date(date),
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
      ],
    });

    if (existingSession) {
      return NextResponse.json(
        { success: false, message: 'Doctor already has a session at this time' },
        { status: 400 }
      );
    }

    // Create new session
    const session = await Session.create({
      doctor,
      specialty,
      hospital,
      floor,
      room,
      date: new Date(date),
      startTime,
      endTime,
      description,
      images: images || [],
      maxAppointments: maxAppointments || 20,
      createdBy: decoded.userId,
    });

    // Populate before returning
    await session.populate('doctor', 'name email degree profileImage');
    await session.populate('specialty', 'name icon');
    await session.populate('createdBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Session created successfully',
        data: session,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating session',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

