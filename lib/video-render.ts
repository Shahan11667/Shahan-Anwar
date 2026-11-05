/**
 * Small browser helpers for recording: used by "Join Videos" (join-clips.tsx) and the Video Editor.
 * Runs entirely in the browser (MediaRecorder + Worker timer), no server-side ffmpeg.
 */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

export function pickMime(): { mime: string; ext: string } {
  const options: Array<[string, string]> = [
    ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (let i = 0; i < options.length; i++) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(options[i][0])) {
      return { mime: options[i][0], ext: options[i][1] };
    }
  }
  return { mime: '', ext: 'webm' };
}

export function makeTicker(ms: number, cb: () => void): () => void {
  try {
    const url = URL.createObjectURL(new Blob([`setInterval(function(){postMessage(0)},${ms})`], { type: 'application/javascript' }));
    const w = new Worker(url);
    w.onmessage = () => cb();
    return () => {
      w.terminate();
      URL.revokeObjectURL(url);
    };
  } catch {
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }
}
