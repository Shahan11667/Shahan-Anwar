import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models' 
import About from '@/models/About'

export async function GET() {
  try {
    await connectDB()
    const about = await About.findOne({ isActive: true })
    
    if (!about) {
      // Return default data if no about data exists
      return NextResponse.json({
        title: "About Shahan Anwar - Full Stack Developer",
        subtitle: "I'm Shahan Anwar, a passionate Full Stack Developer and Next.js expert with over 4 years of experience creating innovative web applications and mobile apps. I specialize in modern technologies like React, TypeScript, Node.js, and mobile app development. Based in Karachi, Pakistan, I help businesses build scalable digital solutions.",
        bioParagraphs: [
          "I'm Shahan Anwar, a creative problem-solver who loves turning complex ideas into simple, beautiful, and intuitive solutions. As a Full Stack Developer and Next.js expert, I have a strong foundation in both frontend and backend development, specializing in React, TypeScript, Node.js, and mobile app development.",
          "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community. I'm passionate about creating innovative web applications and mobile apps that solve real-world problems.",
          "I believe in writing clean, maintainable code and creating user experiences that are both functional and delightful. My expertise spans across web development, mobile app development, and modern JavaScript frameworks."
        ],
        skills: [
          { name: 'Frontend Development', icon: 'Code', technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3'] },
          { name: 'Backend Development', icon: 'Server', technologies: ['Node.js', 'Express', 'Python', 'Django', 'REST APIs', 'GraphQL'] },
          { name: 'Database Management', icon: 'Database', technologies: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL', 'Firebase'] },
          { name: 'Mobile App Development', icon: 'Smartphone', technologies: ['React Native', 'Flutter', 'iOS', 'Android', 'Cross-platform'] },
          { name: 'UI/UX Design', icon: 'Palette', technologies: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'User Research'] },
          { name: 'DevOps & Deployment', icon: 'Globe', technologies: ['AWS', 'Docker', 'Vercel', 'GitHub Actions', 'CI/CD'] },
        ],
        experience: [
          {
            year: '2023 - Present',
            title: 'Senior Full Stack Developer',
            company: 'Tech Corp',
            description: 'Leading development of scalable web applications and mentoring junior developers.',
          },
          {
            year: '2021 - 2023',
            title: 'Full Stack Developer',
            company: 'StartupXYZ',
            description: 'Built and maintained multiple client projects using modern web technologies.',
          },
          {
            year: '2020 - 2021',
            title: 'Frontend Developer',
            company: 'Digital Agency',
            description: 'Created responsive and interactive user interfaces for various clients.',
          },
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            school: 'University of Technology',
            year: '2016 - 2020',
          },
          {
            degree: 'Full Stack Web Development',
            school: 'Coding Bootcamp',
            year: '2020',
          },
        ]
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
