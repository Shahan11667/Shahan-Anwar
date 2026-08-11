import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import PromiseModel from '@/models/Promise'

const DEFAULT_PROMISES = [
  {
    title: "Compassionate Patient Care",
    description: "Putting patient dignity, empathetic listening, and individual care needs at the center of every medical decision.",
    icon: "HeartHandshake",
    ctaText: "Learn More",
    order: 1,
    isActive: true
  },
  {
    title: "Advanced Medical Technology",
    description: "Utilizing modern diagnostic equipment, evidence-based treatments, and cutting-edge healthcare technology.",
    icon: "Activity",
    ctaText: "Learn More",
    order: 2,
    isActive: true
  },
  {
    title: "Comprehensive Treatment Plans",
    description: "Tailoring holistic treatment plans focused on long-term wellness, prevention, and sustained patient recovery.",
    icon: "ClipboardCheck",
    ctaText: "Learn More",
    order: 3,
    isActive: true
  }
]

export async function GET() {
  try {
    await connectDB()
    let promises = await PromiseModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    
    if (!promises || promises.length === 0) {
      promises = await PromiseModel.insertMany(DEFAULT_PROMISES)
    }
    
    return NextResponse.json(promises)
  } catch (error) {
    console.error('Error fetching promises:', error)
    return NextResponse.json(DEFAULT_PROMISES)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const promise = new PromiseModel({ ...body, isActive: true })
    await promise.save()
    return NextResponse.json(promise, { status: 201 })
  } catch (error) {
    console.error('Error creating promise:', error)
    return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, _id, ...updateData } = body
    const targetId = id || _id
    const promise = await PromiseModel.findByIdAndUpdate(targetId, updateData, { new: true })
    return NextResponse.json(promise)
  } catch (error) {
    console.error('Error updating promise:', error)
    return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await PromiseModel.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promise:', error)
    return NextResponse.json({ error: 'Failed to delete promise' }, { status: 500 })
  }
}
