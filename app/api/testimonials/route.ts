import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import Testimonial from '@/models/Testimonial'

// Initial default testimonials matching doctor portfolio standard
const DEFAULT_TESTIMONIALS = [
  {
    patientName: "Sarah Jenkins",
    patientRole: "Verified Patient",
    rating: 5,
    quote: "Dr. Jessica Walsh provided exceptional care during my treatment. Extremely knowledgeable, patient, and truly cares about patient outcomes.",
    isActive: true,
    isFeatured: true
  },
  {
    patientName: "Michael Roberts",
    patientRole: "Verified Patient",
    rating: 5,
    quote: "Very professional, caring, and thorough medical consultation. The preventive health advice gave me complete peace of mind.",
    isActive: true,
    isFeatured: true
  },
  {
    patientName: "Emily Clark",
    patientRole: "Verified Patient",
    rating: 5,
    quote: "The best experience I've had with a medical practitioner. Clear explanations, compassionate bedside manner, and top-tier expertise.",
    isActive: true,
    isFeatured: true
  },
  {
    patientName: "David Miller",
    patientRole: "Verified Patient",
    rating: 5,
    quote: "Attentive, skilled, and highly recommendation for anyone seeking dedicated family medicine and specialized care.",
    isActive: true,
    isFeatured: true
  }
]

export async function GET() {
  try {
    await connectDB()
    let testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 })
    
    if (!testimonials || testimonials.length === 0) {
      // Seed initial default testimonials
      testimonials = await Testimonial.insertMany(DEFAULT_TESTIMONIALS)
    }
    
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(DEFAULT_TESTIMONIALS)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const testimonial = new Testimonial({ ...body, isActive: true })
    await testimonial.save()
    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, ...updateData } = body
    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true })
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await Testimonial.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
