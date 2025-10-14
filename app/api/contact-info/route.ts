import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models' // Import all models to ensure they're registered
import ContactInfo from '@/models/ContactInfo'

export async function GET() {
  try {
    await connectDB()
    const contactInfo = await ContactInfo.findOne({ isActive: true })
    
    if (!contactInfo) {
      // Return default data if no contact info exists
      return NextResponse.json({
        email: "shahananwar39@gmail.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA"
      })
    }
    
    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Deactivate all existing contact info records
    await ContactInfo.updateMany({}, { isActive: false })
    
    // Create new contact info record
    const contactInfo = new ContactInfo({ ...body, isActive: true })
    await contactInfo.save()
    
    return NextResponse.json(contactInfo, { status: 201 })
  } catch (error) {
    console.error('Error creating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to create contact info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Find the active contact info record
    let contactInfo = await ContactInfo.findOne({ isActive: true })
    
    if (!contactInfo) {
      // Create new if none exists
      contactInfo = new ContactInfo({ ...body, isActive: true })
    } else {
      // Update existing
      Object.assign(contactInfo, body)
    }
    
    await contactInfo.save()
    
    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    )
  }
}
