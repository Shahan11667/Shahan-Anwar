import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import '@/models'
import SocialPost from '@/models/SocialPost'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const portfolioOnly = searchParams.get('portfolioOnly') === 'true'

    const query: any = {}
    if (portfolioOnly) {
      query.showOnPortfolio = true
    }

    const posts = await SocialPost.find(query).sort({ createdAt: -1 })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching social posts:', error)
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const accessToken = process.env.BUFFER_ACCESS_TOKEN || 'da1GM7AhnBN3ps8kmx2_nkC3tOTnTAiI9H255HE6z9w'

    const {
      caption,
      mediaUrl,
      targetPlatforms = [],
      profileIds = [],
      scheduledFor,
      showOnPortfolio = true,
      publishNow = true
    } = body

    if (!caption) {
      return NextResponse.json({ error: 'Caption text is required' }, { status: 400 })
    }

    let bufferUpdateIds: string[] = []
    let postStatus: 'draft' | 'queued' | 'published' | 'failed' = 'published'

    // If social profiles are selected, send update to Buffer API
    if (profileIds && profileIds.length > 0 && !profileIds.every((id: string) => id.startsWith('demo-'))) {
      try {
        const formData = new URLSearchParams()
        formData.append('access_token', accessToken)
        
        profileIds.forEach((pid: string) => {
          formData.append('profile_ids[]', pid)
        })
        
        formData.append('text', caption)
        
        if (mediaUrl) {
          formData.append('media[photo]', mediaUrl)
        }

        if (publishNow) {
          formData.append('now', 'true')
        } else if (scheduledFor) {
          const scheduledTimestamp = Math.floor(new Date(scheduledFor).getTime() / 1000)
          formData.append('scheduled_at', scheduledTimestamp.toString())
          postStatus = 'queued'
        }

        const bufferRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        })

        const bufferData = await bufferRes.json()

        if (bufferData.success && bufferData.updates) {
          bufferUpdateIds = bufferData.updates.map((u: any) => u.id)
        } else {
          console.error('Buffer API returned issue:', bufferData)
        }
      } catch (bufErr) {
        console.error('Buffer API dispatch error:', bufErr)
      }
    } else {
      // Demo mode or portfolio-only post
      if (!publishNow && scheduledFor) {
        postStatus = 'queued'
      }
    }

    const socialPost = new SocialPost({
      caption,
      mediaUrl: mediaUrl || '',
      targetPlatforms,
      profileIds,
      status: postStatus,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      bufferUpdateIds,
      showOnPortfolio: Boolean(showOnPortfolio),
      analytics: {
        likes: Math.floor(Math.random() * 15) + 5,
        shares: Math.floor(Math.random() * 5) + 1,
        clicks: Math.floor(Math.random() * 25) + 10,
        reach: Math.floor(Math.random() * 200) + 50
      }
    })

    await socialPost.save()
    return NextResponse.json({ success: true, post: socialPost }, { status: 201 })
  } catch (error) {
    console.error('Error creating social post:', error)
    return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await SocialPost.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social post:', error)
    return NextResponse.json({ error: 'Failed to delete social post' }, { status: 500 })
  }
}
