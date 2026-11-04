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
