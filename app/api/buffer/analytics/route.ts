import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import SocialPost from '@/models/SocialPost'

export async function GET() {
  try {
    await connectDB()
    const posts = await SocialPost.find({ status: 'published' })
    
    for (const post of posts) {
      if (!post.analytics) {
        post.analytics = { likes: 0, shares: 0, clicks: 0, reach: 0 }
        await post.save()
      }
    }

    return NextResponse.json({ success: true, updatedCount: posts.length })
  } catch (error) {
    console.error('Error updating analytics:', error)
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
  }
}
