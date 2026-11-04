import { NextRequest, NextResponse } from 'next/server';
import { guardStudio } from '@/lib/studio-guard';

const BUFFER_URL = 'https://api.buffer.com';
const BUFFER_KEY = process.env.BUFFER_API_KEY || '';

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(BUFFER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BUFFER_KEY}` },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Buffer returned ${res.status}: ${text.slice(0, 200)}`);
  }
  if (json.errors?.length) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  if (!res.ok) throw new Error(`Buffer returned ${res.status}`);
  return json.data;
}

const POST_MUTATION = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    __typename
    ... on PostActionSuccess { post { id } }
    ... on MutationError { message }
  }
}`;

export async function POST(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  if (!BUFFER_KEY) {
    return NextResponse.json({ success: false, error: 'BUFFER_API_KEY is not set on the server.' }, { status: 500 });
  }
  try {
    const body = await req.json();

    if (body.action === 'channels') {
      let orgId = process.env.BUFFER_ORGANIZATION_ID || '';
      if (!orgId) {
        const acc = await gql(`query { account { organizations { id name } } }`);
        orgId = acc?.account?.organizations?.[0]?.id;
      }
      if (!orgId) throw new Error('No Buffer organization found. Set BUFFER_ORGANIZATION_ID.');
      const data = await gql(
        `query($org: OrganizationId!) { channels(input: { organizationId: $org }) { id name displayName service avatar isQueuePaused } }`,
        { org: orgId }
      );
      return NextResponse.json({ success: true, channels: data.channels });
    }

    if (body.action === 'post') {
      const { channelId, service, text, title, videoUrl, mode, dueAt } = body;
      if (!channelId || !videoUrl) throw new Error('channelId and videoUrl are required');
      const metadata: Record<string, unknown> = {};
      if (service === 'youtube') metadata.youtube = { title: String(title || '').slice(0, 100), privacy: 'public', madeForKids: false };
      if (service === 'instagram') metadata.instagram = { type: 'reel', shouldShareToFeed: true };
      if (service === 'facebook') metadata.facebook = { type: 'reel' };
      if (service === 'tiktok') metadata.tiktok = { title: String(title || '').slice(0, 150) };
      const input: Record<string, unknown> = {
        channelId,
        text,
        schedulingType: 'automatic',
        mode: dueAt ? 'customScheduled' : mode === 'queue' ? 'addToQueue' : 'shareNow',
        assets: [{ video: { url: videoUrl } }],
        metadata,
      };
      if (dueAt) input.dueAt = dueAt;
      const data = await gql(POST_MUTATION, { input });
      const r = data.createPost;
      if (r.__typename !== 'PostActionSuccess') throw new Error(r.message || 'Buffer rejected the post');
      return NextResponse.json({ success: true, postId: r.post?.id });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Buffer request failed' }, { status: 502 });
  }
}
