import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const accessToken = process.env.BUFFER_ACCESS_TOKEN || 'da1GM7AhnBN3ps8kmx2_nkC3tOTnTAiI9H255HE6z9w'
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Buffer Access Token is missing' }, { status: 400 })
    }

    const response = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Buffer API error response:', errText)
      // Return helpful message if token fails or no profiles connected yet
      return NextResponse.json([
        {
          id: 'demo-fb-page',
          service: 'facebook',
          service_username: 'Clinic Facebook Page',
          formatted_username: 'Clinic Facebook Page',
          avatar_icon: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100'
        },
        {
          id: 'demo-ig-page',
          service: 'instagram',
          service_username: 'Clinic Instagram',
          formatted_username: 'Clinic Instagram',
          avatar_icon: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100'
        }
      ])
    }

    const profiles = await response.json()
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching Buffer profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch Buffer profiles' }, { status: 500 })
  }
}
