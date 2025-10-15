import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import Appointment from '@/models/Appointment';
import Session from '@/models/Session';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// GET - Get patient's own appointments
export async function GET(request: NextRequest) {
  try {
    // Verify patient token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'patient') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query - filter by logged-in patient
    const query: any = {
      patient: decoded.userId,
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email degree profileImage phone')
      .populate({
        path: 'session',
        populate: {
          path: 'specialty',
          select: 'name icon',
        },
      })
      .sort({ appointmentDate: -1 })
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

// POST - Book an appointment
export async function POST(request: NextRequest) {
  try {
    // Verify patient token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'patient') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { sessionId, appointmentTime, notes } = body;

    // Validation
    if (!sessionId || !appointmentTime) {
      return NextResponse.json(
        { success: false, message: 'Session ID and appointment time are required' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentTime)) {
      return NextResponse.json(
        { success: false, message: 'Time must be in HH:mm format (e.g., 09:30)' },
        { status: 400 }
      );
    }

    // Find session and populate specialty
    const session = await Session.findById(sessionId).populate('specialty', 'name icon');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or has been deleted' },
        { status: 404 }
      );
    }

    // Verify session has valid doctor and specialty
    if (!session.doctor || !session.specialty) {
      return NextResponse.json(
        { success: false, message: 'Session has invalid data. Please contact support.' },
        { status: 400 }
      );
    }

    // Check if session is active
    if (!session.isActive) {
      return NextResponse.json(
        { success: false, message: 'Session is not active' },
        { status: 400 }
      );
    }

    // Check if session is in the future
    if (session.date < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Cannot book past sessions' },
        { status: 400 }
      );
    }

    // Check if session has available slots
    if (session.bookedAppointments >= session.maxAppointments) {
      return NextResponse.json(
        { success: false, message: 'Session is fully booked' },
        { status: 400 }
      );
    }

    // Check if time is within session time range
    if (appointmentTime < session.startTime || appointmentTime > session.endTime) {
      return NextResponse.json(
        {
          success: false,
          message: `Appointment time must be between ${session.startTime} and ${session.endTime}`,
        },
        { status: 400 }
      );
    }

    // Check if patient already has an appointment for this session
    const existingAppointment = await Appointment.findOne({
      patient: decoded.userId,
      session: sessionId,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'You already have an appointment for this session' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: decoded.userId,
      session: sessionId,
      doctor: session.doctor,
      appointmentDate: session.date,
      appointmentTime,
      notes,
      status: 'pending',
    });

    // Increment booked appointments count
    session.bookedAppointments += 1;
    await session.save();

    // Populate appointment data
    await appointment.populate('doctor', 'name email degree profileImage phone');
    await appointment.populate({
      path: 'session',
      populate: {
        path: 'specialty',
        select: 'name icon',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error booking appointment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

