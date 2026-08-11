import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models' // Import all models to ensure they're registered
import Hero from '@/models/Hero'

export async function GET() {
  try {
    await connectDB()
    const hero = await Hero.findOne({ isActive: true })
    
    if (!hero) {
      // Return default data for doctor portfolio if no hero data exists
      return NextResponse.json({
        badge: "DOCTOR & CLINIC SERVICES",
        name: "Dr. Jessica Walsh",
        title: "A dedicated doctor you can trust",
        subtitle: "Board Certified Physician & Medical Specialist",
        description: "Providing compassionate, comprehensive healthcare for patients. Dedicated to clinical excellence, preventive care, and holistic wellness.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop",
        emergencyPhone: "(555) 123-4567",
        featureCards: [
          {
            title: "Emergency Call",
            description: "24/7 immediate assistance and emergency hotline support for urgent medical needs.",
            icon: "PhoneCall"
          },
          {
            title: "24/7 Hours Service",
            description: "Round the clock patient consultation, emergency booking, and medical advice.",
            icon: "Clock"
          },
          {
            title: "Personalized Care",
            description: "Tailored treatment plans focused on individual health goals and sustained well-being.",
            icon: "ShieldCheck"
          }
        ],
        resumeLink: "#",
        socialLinks: {
          github: "",
          linkedin: "https://linkedin.com",
          email: "mailto:dr.jessica@clinic.com"
        }
      })
    }
    
    return NextResponse.json(hero)
  } catch (error) {
    console.error('Error fetching hero data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Deactivate all existing hero records
    await Hero.updateMany({}, { isActive: false })
    
    // Create new hero record
    const hero = new Hero({ ...body, isActive: true })
    await hero.save()
    
    return NextResponse.json(hero, { status: 201 })
  } catch (error) {
    console.error('Error creating hero data:', error)
    return NextResponse.json(
      { error: 'Failed to create hero data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Find the active hero record
    let hero = await Hero.findOne({ isActive: true })
    
    if (!hero) {
      // Create new if none exists
      hero = new Hero({ ...body, isActive: true })
    } else {
      // Update existing
      Object.assign(hero, body)
    }
    
    await hero.save()
    
    return NextResponse.json(hero)
  } catch (error) {
    console.error('Error updating hero data:', error)
    return NextResponse.json(
      { error: 'Failed to update hero data' },
      { status: 500 }
    )
  }
}
