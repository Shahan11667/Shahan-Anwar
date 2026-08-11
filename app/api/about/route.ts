import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models' 
import About from '@/models/About'

export async function GET() {
  try {
    await connectDB()
    const about = await About.findOne({ isActive: true })
    
    if (!about) {
      // Return default data for doctor portfolio if no about data exists
      return NextResponse.json({
        badge: "ABOUT ME",
        title: "Professional Summary",
        accentTitle: "Summary",
        subtitle: "As a dedicated medical practitioner with over 15 years of experience, I specialize in providing compassionate, comprehensive healthcare for patients of all ages.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop",
        bioParagraphs: [
          "With over 15 years of active medical practice, I am committed to advancing patient outcomes through evidence-based diagnosis, preventive health strategies, and empathetic bedside care.",
          "Our clinic provides a welcoming, modern environment equipped with state-of-the-art diagnostic tools to handle everything from routine checkups to complex specialized treatments.",
          "We focus on empowering patients with knowledge and tailored wellness plans that foster long-term health, vitality, and peace of mind."
        ],
        stats: [
          { value: "15+", label: "Years Experience" },
          { value: "10k+", label: "Happy Patients" },
          { value: "100%", label: "Quality Healthcare" }
        ],
        skills: [],
        experience: [],
        education: []
      })
    }
    
    return NextResponse.json(about)
  } catch (error) {
    console.error('Error fetching about data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    await About.updateMany({}, { isActive: false })
    const about = new About({ ...body, isActive: true })
    await about.save()
    return NextResponse.json(about, { status: 201 })
  } catch (error) {
    console.error('Error creating about data:', error)
    return NextResponse.json(
      { error: 'Failed to create about data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    let about = await About.findOne({ isActive: true })
    if (!about) {
      about = new About({ ...body, isActive: true })
    } else {
      Object.assign(about, body)
    }
    await about.save()
    return NextResponse.json(about)
  } catch (error) {
    console.error('Error updating about data:', error)
    return NextResponse.json(
      { error: 'Failed to update about data' },
      { status: 500 }
    )
  }
}
