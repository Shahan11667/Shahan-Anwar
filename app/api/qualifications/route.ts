import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import Qualification from '@/models/Qualification'

const DEFAULT_QUALIFICATIONS = [
  {
    type: "qualifications",
    title: "Doctor of Medicine (MD)",
    institution: "Harvard Medical School",
    year: "2014",
    description: "Graduated with High Honors in General Medicine & Patient Care Clinical Rotations.",
    order: 1,
    isActive: true
  },
  {
    type: "qualifications",
    title: "Clinical Fellowship in Cardiology & Internal Medicine",
    institution: "Johns Hopkins Hospital",
    year: "2016",
    description: "Specialized post-doctoral clinical fellowship emphasizing cardiovascular prevention and intensive patient care.",
    order: 2,
    isActive: true
  },
  {
    type: "certifications",
    title: "Board Certified in Internal Medicine & General Practice",
    institution: "American Board of Medical Specialties (ABMS)",
    year: "2018",
    description: "National certification signifying highest standards of clinical knowledge and patient safety.",
    order: 3,
    isActive: true
  },
  {
    type: "certifications",
    title: "Advanced Cardiac Life Support (ACLS) & BLS",
    institution: "American Heart Association",
    year: "2023",
    description: "Certified expert in emergency cardiovascular care and resuscitation management.",
    order: 4,
    isActive: true
  },
  {
    type: "awards",
    title: "Excellence in Compassionate Patient Care Award",
    institution: "National Healthcare Association",
    year: "2022",
    description: "Recognized for outstanding bedside care, high patient satisfaction rates, and clinical dedication.",
    order: 5,
    isActive: true
  },
  {
    type: "awards",
    title: "Top Doctor Award in Internal & Preventive Medicine",
    institution: "Medical Excellence Review",
    year: "2024",
    description: "Awarded based on peer evaluations, patient outcomes, and clinical leadership.",
    order: 6,
    isActive: true
  }
]

export async function GET() {
  try {
    await connectDB()
    let qualifications = await Qualification.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    
    if (!qualifications || qualifications.length === 0) {
      qualifications = await Qualification.insertMany(DEFAULT_QUALIFICATIONS)
    }
    
    return NextResponse.json(qualifications)
  } catch (error) {
    console.error('Error fetching qualifications:', error)
    return NextResponse.json(DEFAULT_QUALIFICATIONS)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const qualification = new Qualification({ ...body, isActive: true })
    await qualification.save()
    return NextResponse.json(qualification, { status: 201 })
  } catch (error) {
    console.error('Error creating qualification:', error)
    return NextResponse.json({ error: 'Failed to create qualification' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, _id, ...updateData } = body
    const targetId = id || _id
    const qualification = await Qualification.findByIdAndUpdate(targetId, updateData, { new: true })
    return NextResponse.json(qualification)
  } catch (error) {
    console.error('Error updating qualification:', error)
    return NextResponse.json({ error: 'Failed to update qualification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await Qualification.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting qualification:', error)
    return NextResponse.json({ error: 'Failed to delete qualification' }, { status: 500 })
  }
}
