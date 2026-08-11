import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import Appointment from '@/models/Appointment'

export async function GET() {
  try {
    await connectDB()
    const appointments = await Appointment.find({}).sort({ createdAt: -1 })
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.patientName || !body.patientEmail || !body.patientPhone || !body.appointmentDate || !body.appointmentTime) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    const appointment = new Appointment({
      patientName: body.patientName,
      patientEmail: body.patientEmail,
      patientPhone: body.patientPhone,
      serviceRequested: body.serviceRequested || 'General Consultation',
      appointmentDate: new Date(body.appointmentDate),
      appointmentTime: body.appointmentTime,
      notes: body.notes || '',
      status: 'pending'
    })

    await appointment.save()
    return NextResponse.json({ success: true, message: 'Appointment request submitted successfully!', appointment }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Failed to submit appointment request' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, status, notes, cancelReason } = body

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 })
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status, notes, cancelReason },
      { new: true }
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await Appointment.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
