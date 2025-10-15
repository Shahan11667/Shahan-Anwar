import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get doctor's appointments
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query - filter by logged-in doctor
    const query: any = {
      doctor: decoded.userId,
    };

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.appointmentDate = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone dateOfBirth gender address profileImage')
      .populate({
        path: 'session',
        populate: {
          path: 'specialty',
          select: 'name icon',
        },
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    // Filter out appointments with null/deleted sessions
    const validAppointments = appointments.filter(apt => apt.session != null);

    const total = await Appointment.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        message: 'Appointments fetched successfully',
        data: validAppointments,
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
        message: 'Error fetching appointments',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

