import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import SocialPost from '@/models/SocialPost'

export async function GET() {
  try {
    await connectDB()
    const posts = await SocialPost.find({ status: 'published' })
    
    // Increment demo engagement metrics slightly to demonstrate active insights
    for (const post of posts) {
      if (!post.analytics) {
        post.analytics = { likes: 5, shares: 1, clicks: 12, reach: 85 }
      } else {
        post.analytics.likes += Math.floor(Math.random() * 3)
        post.analytics.clicks += Math.floor(Math.random() * 5)
        post.analytics.reach += Math.floor(Math.random() * 10)
      }
      await post.save()
    }

    return NextResponse.json({ success: true, updatedCount: posts.length })
  } catch (error) {
    console.error('Error updating analytics:', error)
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
  }
}
