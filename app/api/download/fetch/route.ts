import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ status: 'error', text: 'URL is required' }, { status: 400 });

    console.log(`[Middleman] Fetching for: ${url}`);

    // Engine 1: Your Local Python API (The Fixed Version)
    try {
      console.log(`[Middleman] Trying Local Python API at port 8000...`);
      const pyResponse = await fetch('http://127.0.0.1:8000/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url }),
        signal: AbortSignal.timeout(10000)
      });

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        if (pyData.success) {
          console.log(`[Middleman] Success from Local Python API`);
          const formats = [...(pyData.video_formats || []), ...(pyData.audio_formats || [])];
          return NextResponse.json({
            status: 'picker',
            text: pyData.title,
            picker: formats.map((f: any) => ({
              type: f.vcodec !== 'none' ? 'video' : 'audio',
              url: f.url,
              text: `${f.resolution || 'Audio'} (${f.ext})`
            }))
          });
        }
      }
    } catch (err: any) {
      console.warn(`[Middleman] Local Python fallback: ${err.message}`);
    }

    // Engine 2: Cobalt Global Mesh (Backup)
    const engines = ['https://nachos.imput.net', 'https://peppas.cc'];
    for (const engine of engines) {
      try {
        const response = await fetch(engine, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url, vQuality: '720', isv10: true }),
          signal: AbortSignal.timeout(6000)
        });
        if (response.ok) return NextResponse.json(await response.json());
      } catch (e) {}
    }

    return NextResponse.json({ 
      status: 'error', 
      text: 'All download engines are currently busy. Please try again in 1 minute.' 
    }, { status: 502 });

  } catch (error: any) {
    return NextResponse.json({ status: 'error', text: 'Connection issue: ' + error.message }, { status: 500 });
  }
}
