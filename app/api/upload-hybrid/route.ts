import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Try Cloudinary first (for production)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        // Convert to base64 for Cloudinary
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUrl, {
          folder: 'portfolio',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        })

        return NextResponse.json({
          success: true,
          url: result.secure_url,
          filename: file.name,
          type: 'cloudinary',
          public_id: result.public_id
        })
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError)
        // Fall back to local storage
      }
    }

    // Fallback: Local storage (for development)
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const filepath = join(uploadsDir, filename)

      // Write file to disk
      await writeFile(filepath, buffer)

      // Return the public URL
      const fileUrl = `/uploads/${filename}`
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: filename,
        type: 'local'
      })
    } catch (localError) {
      console.error('Local upload failed:', localError)
      
      // Final fallback: Data URL
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: file.name,
        type: 'data-url'
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
