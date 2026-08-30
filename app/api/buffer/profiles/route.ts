import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const accessToken = 'igwe5vJb1tyR0-dFdPUgsaUXVmOHjWgDgdHCWnYcl9T';

    if (!accessToken) {
      return NextResponse.json({ error: 'Buffer Access Token is missing' }, { status: 400 })
    }

    // Step 1: Fetch account organization ID
    const orgQuery = `
      query {
        account {
          id
          organizations {
            id
            name
          }
        }
      }
    `;

    const orgRes = await fetch('https://api.buffer.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify({ query: orgQuery })
    });

    const orgData = await orgRes.json();

    if (!orgRes.ok || orgData.errors) {
      console.error('Buffer GraphQL org error:', orgData);
      return returnDemoProfiles();
    }

    const organizations = orgData.data?.account?.organizations;
    if (!organizations || organizations.length === 0) {
      console.warn('No organizations found for Buffer account');
      return returnDemoProfiles();
    }
    const organizationId = organizations[0].id;

    // Step 2: Fetch channels for this organization
    const channelsQuery = `
      query {
        channels(input: { organizationId: "${organizationId}" }) {
          id
          name
          service
          avatar
        }
      }
    `;

    const channelsRes = await fetch('https://api.buffer.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify({ query: channelsQuery })
    });

    const channelsData = await channelsRes.json();
    if (!channelsRes.ok || channelsData.errors) {
      console.error('Buffer GraphQL channels error:', channelsData);
      return returnDemoProfiles();
    }

    const channels = channelsData.data?.channels || [];

    // Map to the legacy format that the frontend expects
    const profiles = channels.map((channel: any) => ({
      id: channel.id,
      service: channel.service,
      service_username: channel.name,
      formatted_username: channel.name,
      avatar_icon: channel.avatar
    }));

    if (profiles.length === 0) return returnDemoProfiles();
    return NextResponse.json(profiles)

  } catch (error) {
    console.error('Error fetching Buffer profiles via GraphQL:', error)
    return NextResponse.json({ error: 'Failed to fetch Buffer profiles' }, { status: 500 })
  }
}

function returnDemoProfiles() {
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
  ]);
}
