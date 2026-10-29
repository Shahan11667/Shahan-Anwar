import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File | null;
    const requestedLanguage = (formData.get('language') as string) || 'auto';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to temp file
    const ext = path.extname(file.name || 'audio.ogg') || '.ogg';
    tempFilePath = path.join(os.tmpdir(), `audio-transcribe-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
    fs.writeFileSync(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), 'scripts', 'transcribe-audio.js');

    // Run Node transcription script
    const { stdout, stderr } = await execFileAsync(
      'node',
      [scriptPath, tempFilePath, requestedLanguage],
      { maxBuffer: 10 * 1024 * 1024, timeout: 60000 }
    );

    // Parse the JSON line from stdout
    const lines = stdout.trim().split('\n');
    let jsonResult: any = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          jsonResult = JSON.parse(line);
          break;
        } catch (e) {
          // continue
        }
      }
    }

    if (jsonResult && jsonResult.success) {
      return NextResponse.json(jsonResult);
    }

    return NextResponse.json({
      success: false,
      error: (jsonResult && jsonResult.error) || stderr || 'Failed to parse transcription output',
    }, { status: 500 });

  } catch (error: any) {
    console.error('[Audio Transcription Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Server error processing audio transcription',
    }, { status: 500 });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore
      }
    }
  }
}
