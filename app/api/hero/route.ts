import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Hero from '@/models/Hero'

export async function GET() {
  try {
    await connectDB()
    const hero = await Hero.findOne({ isActive: true })
    
    if (!hero) {
      // Return default data if no hero data exists
      return NextResponse.json({
        name: "Shahan Anwar",
        title: "Full Stack Developer & UI/UX Enthusiast",
        subtitle: "Passionate about creating digital experiences",
        description: "I create beautiful, functional, and user-centered digital experiences that make a difference. With expertise in modern web technologies and a keen eye for design, I bring ideas to life through code.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
        resumeLink: "#",
        socialLinks: {
          github: "https://github.com/shahananwar39",
          linkedin: "https://linkedin.com/in/shahananwar39",
          email: "mailto:shahananwar39@gmail.com"
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
