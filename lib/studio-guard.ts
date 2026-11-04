import { NextRequest, NextResponse } from 'next/server';

/**
 * The admin area has no server-side login, so routes that spend money or post to social accounts
 * require the STUDIO_PUBLISH_PASSWORD env var, sent by the UI in the `x-studio-key` header.
 */
export function guardStudio(req: NextRequest): NextResponse | null {
  const expected = process.env.STUDIO_PUBLISH_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: 'STUDIO_PUBLISH_PASSWORD is not set on the server. Add it to .env / Vercel env vars.' },
      { status: 500 }
    );
  }
  if (req.headers.get('x-studio-key') !== expected) {
    return NextResponse.json({ success: false, error: 'Wrong publish password.' }, { status: 401 });
  }
  return null;
}

/**
 * For the free AI routes (text / image / voice / captions): no password to type, but the request
 * must come from this site's own pages (Origin or Referer host equals Host), so other websites can't use it.
 */
export function guardSameOrigin(req: NextRequest): NextResponse | null {
  const host = req.headers.get('host') || '';
  const from = req.headers.get('origin') || req.headers.get('referer') || '';
  let fromHost = '';
  try {
    fromHost = new URL(from).host;
  } catch {
    /* none */
  }
  if (host && fromHost === host) return null;
  return NextResponse.json({ success: false, error: 'Not allowed from outside the site.' }, { status: 403 });
}
