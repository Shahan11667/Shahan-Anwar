import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import Service from '@/models/Service'

const DEFAULT_SERVICES = [
  {
    title: "Internal Medicine & Prevention",
    accentTitle: "Internal Medicine",
    description: "Comprehensive health assessments, chronic condition management, and personalized preventive care strategies.",
    icon: "Stethoscope",
    category: "Internal Medicine",
    order: 1,
    isActive: true
  },
  {
    title: "Pediatric Care",
    accentTitle: "Pediatric Care",
    description: "Specialized healthcare for infants, children, and adolescents focusing on growth, vaccination, and health monitoring.",
    icon: "Baby",
    category: "Pediatrics",
    order: 2,
    isActive: true
  },
  {
    title: "Cardiology Consultation",
    accentTitle: "Cardiology",
    description: "Advanced cardiac risk evaluation, ECG assessments, heart disease prevention, and hypertension management.",
    icon: "HeartPulse",
    category: "Cardiology",
    order: 3,
    isActive: true
  },
  {
    title: "General Health Checkup",
    accentTitle: "Health Checkup",
    description: "Full body screening, laboratory diagnostics, lifestyle counselling, and routine wellness examinations.",
    icon: "ShieldCheck",
    category: "General Practice",
    order: 4,
    isActive: true
  }
]

export async function GET() {
  try {
    await connectDB()
    let services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    
    if (!services || services.length === 0) {
      services = await Service.insertMany(DEFAULT_SERVICES)
    }
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(DEFAULT_SERVICES)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const service = new Service({ ...body, isActive: true })
    await service.save()
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, _id, ...updateData } = body
    const targetId = id || _id
    const service = await Service.findByIdAndUpdate(targetId, updateData, { new: true })
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await Service.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
