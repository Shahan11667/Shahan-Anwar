import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';

// GET - Get available sessions for patients to book
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctor');
    const specialtyId = searchParams.get('specialty');
    const hospital = searchParams.get('hospital');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query - only show active sessions with available slots
    const query: any = {
      isActive: true,
      $expr: {
        $lt: ['$bookedAppointments', '$maxAppointments'], // has available slots
      },
    };

    // Only show future sessions
    const now = new Date();
    query.date = { $gte: now };

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
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay,
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }

    const skip = (page - 1) * limit;

    const sessions = await Session.find(query)
      .populate('doctor', 'name email degree profileImage phone rating')
      .populate('specialty', 'name description icon')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments(query);

    // Add available slots info
    const sessionsWithSlots = sessions.map((session) => {
      const sessionObj = session.toObject();
      return {
        ...sessionObj,
        availableSlots: sessionObj.maxAppointments - sessionObj.bookedAppointments,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Available sessions fetched successfully',
        data: sessionsWithSlots,
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
        message: 'Error fetching available sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

