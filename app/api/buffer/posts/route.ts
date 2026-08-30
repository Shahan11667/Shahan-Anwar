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
    const accessToken = 'igwe5vJb1tyR0-dFdPUgsaUXVmOHjWgDgdHCWnYcl9T';
    console.log('[Buffer Token Used]:', accessToken.substring(0, 10) + '...');

    const {
      caption,
      mediaUrl,
      targetPlatforms = [],
      profileIds = [],
      scheduledFor,
      showOnPortfolio = true,
      publishNow = true
    } = body

    // 1. Validation: Caption is mandatory
    if (!caption || typeof caption !== 'string' || !caption.trim()) {
      return NextResponse.json({ error: 'Post caption text is required.' }, { status: 400 })
    }

    // 2. Validation: Scheduled date if not publishing now
    if (!publishNow && !scheduledFor) {
      return NextResponse.json({ error: 'Scheduled date/time is required when not publishing immediately.' }, { status: 400 })
    }

    let bufferUpdateIds: string[] = []
    let postStatus: 'draft' | 'queued' | 'published' | 'failed' = publishNow ? 'published' : 'queued'
    const dispatchResults: Array<{
      channelId: string
      channelName: string
      service: string
      success: boolean
      updateId?: string
      error?: string
    }> = []

    const isRealBufferProfile = profileIds && profileIds.length > 0 && !profileIds.every((id: string) => id.startsWith('demo-'))

    if (isRealBufferProfile) {
      try {
        console.log(`[Buffer Dispatch] Starting dispatch for ${profileIds.length} profiles...`)

        // Fetch organization to query channels
        const orgRes = await fetch('https://api.buffer.com', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: `query { account { organizations { id name } } }` })
        })

        const orgData = await orgRes.json()
        if (!orgRes.ok || orgData.errors) {
          console.error('[Buffer API] Failed to fetch organization:', JSON.stringify(orgData, null, 2))
          throw new Error(orgData.errors?.[0]?.message || 'Failed to authenticate with Buffer organization API.')
        }

        const orgId = orgData.data?.account?.organizations?.[0]?.id
        if (!orgId) {
          console.error('[Buffer API] No organization ID found in account.')
          throw new Error('No Buffer organization found for the configured access token.')
        }

        // Fetch all channels under this organization to get their service and names
        const chanRes = await fetch('https://api.buffer.com', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `query { channels(input: { organizationId: "${orgId}" }) { id name service } }`
          })
        })

        const chanData = await chanRes.json()
        const channels: Array<{ id: string; name: string; service: string }> = chanData.data?.channels || []
        const channelMap = new Map<string, { name: string; service: string }>()
        channels.forEach(ch => channelMap.set(ch.id, { name: ch.name, service: ch.service }))

        const createPostMutation = `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              ... on PostActionSuccess {
                post {
                  id
                  status
                }
              }
              ... on MutationError {
                message
              }
            }
          }
        `

        // Dispatch to each selected profile
        for (const pid of profileIds) {
          const channelInfo = channelMap.get(pid) || { name: pid, service: 'unknown' }
          const service = channelInfo.service.toLowerCase()

          // Instagram validation: Instagram strictly requires an image asset for posts
          if (service === 'instagram' && !mediaUrl) {
            console.warn(`[Buffer Warning] Instagram post skipped: Instagram requires an image asset.`)
            dispatchResults.push({
              channelId: pid,
              channelName: channelInfo.name,
              service: channelInfo.service,
              success: false,
              error: 'Instagram posts require an image. Please attach an image URL.'
            })
            continue
          }

          // Build platform-specific metadata
          let metadata: any = undefined
          if (service === 'facebook') {
            metadata = { facebook: { type: 'post' } }
          } else if (service === 'instagram') {
            metadata = { instagram: { type: 'post', shouldShareToFeed: true } }
          }

          const input: any = {
            channelId: pid,
            mode: publishNow ? 'shareNow' : 'schedule',
            needsApproval: false,
            schedulingType: 'automatic',
            text: caption.trim()
          }

          if (metadata) {
            input.metadata = metadata
          }

          if (mediaUrl) {
            input.assets = [
              {
                image: {
                  url: mediaUrl
                }
              }
            ]
          }

          if (!publishNow && scheduledFor) {
            input.dueAt = new Date(scheduledFor).toISOString()
          }

          console.log(`[Buffer Sending] To ${channelInfo.name} (${service}) with input:`, JSON.stringify(input, null, 2))

          const bufferRes = await fetch('https://api.buffer.com', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: createPostMutation,
              variables: { input }
            })
          })

          const bufferData = await bufferRes.json()
          console.log(`[Buffer Response] For ${channelInfo.name}:`, JSON.stringify(bufferData, null, 2))

          if (!bufferRes.ok || bufferData.errors) {
            const errorMsg = bufferData.errors?.map((e: any) => e.message).join(', ') || `HTTP ${bufferRes.status} Error`
            console.error(`[Buffer Error] Profile ${channelInfo.name} failed:`, errorMsg)
            dispatchResults.push({
              channelId: pid,
              channelName: channelInfo.name,
              service: channelInfo.service,
              success: false,
              error: errorMsg
            })
          } else {
            const createPostResult = bufferData.data?.createPost
            if (createPostResult?.message) {
              // MutationError
              console.error(`[Buffer MutationError] Profile ${channelInfo.name} failed:`, createPostResult.message)
              dispatchResults.push({
                channelId: pid,
                channelName: channelInfo.name,
                service: channelInfo.service,
                success: false,
                error: createPostResult.message
              })
            } else if (createPostResult?.post?.id) {
              const newId = createPostResult.post.id
              bufferUpdateIds.push(newId)
              console.log(`[Buffer Success] Profile ${channelInfo.name} posted successfully! Buffer Post ID: ${newId}`)
              dispatchResults.push({
                channelId: pid,
                channelName: channelInfo.name,
                service: channelInfo.service,
                success: true,
                updateId: newId
              })
            } else {
              const unknownError = 'Buffer returned unknown response payload'
              console.error(`[Buffer Unknown] Profile ${channelInfo.name}:`, bufferData)
              dispatchResults.push({
                channelId: pid,
                channelName: channelInfo.name,
                service: channelInfo.service,
                success: false,
                error: unknownError
              })
            }
          }
        }
      } catch (bufErr: any) {
        console.error('[Buffer API Fatal Error]:', bufErr)
        return NextResponse.json({
          error: `Buffer Dispatch Failed: ${bufErr.message || 'Unknown network error'}`
        }, { status: 502 })
      }

      // Determine final status based on actual Buffer results
      const anySucceeded = dispatchResults.some(r => r.success)
      const allFailed = dispatchResults.length > 0 && !anySucceeded

      if (allFailed) {
        postStatus = 'failed'
      } else if (!publishNow && scheduledFor) {
        postStatus = 'queued'
      } else {
        postStatus = 'published'
      }
    }

    // Save to MongoDB with real zero initial analytics (NO fake random numbers)
    const socialPost = new SocialPost({
      caption: caption.trim(),
      mediaUrl: mediaUrl || '',
      targetPlatforms,
      profileIds,
      status: postStatus,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      bufferUpdateIds,
      showOnPortfolio: Boolean(showOnPortfolio),
      analytics: {
        likes: 0,
        shares: 0,
        clicks: 0,
        reach: 0
      }
    })

    await socialPost.save()

    const hasFailures = dispatchResults.some(r => !r.success)

    return NextResponse.json({
      success: postStatus !== 'failed',
      post: socialPost,
      dispatchResults,
      warnings: hasFailures ? dispatchResults.filter(r => !r.success) : []
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating social post:', error)
    return NextResponse.json({ error: error.message || 'Failed to create social post' }, { status: 500 })
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
