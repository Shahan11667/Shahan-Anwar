import { generateText } from '@/lib/llm';
import DailyPack, { IDailyPack } from '@/models/DailyPack';

export const BESHAAN_CONTEXT =
  'CHANNEL: BESHAAN. Tagline: Three Creators | Three Personalities | One Amazing Journey. Two girls and one boy blending fashion, lifestyle vibes and gaming entertainment. Tone: energetic trio banter, friendly, trendy, fun, positive, family-safe. The three recurring characters have distinct personalities (the stylish fashion girl, the bubbly lifestyle girl, the funny gamer boy) and always look the same.';

export function todayKey(): string {
  // Pakistan time (UTC+5) so "today" matches the creator's day
  return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

function parseJson(text: string): any {
  const t = text.replace(/```json|```/gi, '');
  return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
}

const LANG: Record<string, string> = {
  roman_urdu: 'Roman Urdu (Urdu written in English letters)',
  english: 'English',
  urdu: 'Urdu (Arabic script)',
};

export async function generatePack(opts: { source: 'cron' | 'manual'; hint?: string }): Promise<IDailyPack> {
  const sceneCount = Math.min(12, Math.max(3, Number(process.env.DAILY_PACK_SCENES) || 7));
  const language = LANG[process.env.DAILY_PACK_LANGUAGE || 'roman_urdu'] || LANG.roman_urdu;
  const genre = process.env.DAILY_PACK_GENRE || 'Beshaan (Fashion, Lifestyle, Gaming)';
  const context = genre.toLowerCase().startsWith('beshaan') ? BESHAAN_CONTEXT : `CHANNEL GENRE: ${genre}.`;

  const recent = await DailyPack.find({}).sort({ createdAt: -1 }).limit(20).select('title').lean();
  const avoid = recent.map((r: any) => r.title).filter(Boolean).join(' | ');

  const prompt = `${context}
Create ONE complete, ready-to-produce short video package for today (vertical 9:16, about ${sceneCount * 8} seconds).
${opts.hint ? `Creator's hint: ${opts.hint}\n` : ''}Do NOT repeat these earlier videos: ${avoid || '(none yet)'}.
Dialogue/narration/captions language: ${language}.

The scenes will be pasted one by one into Google Flow / Veo (an AI video generator), each in a separate generation. So EVERY scene prompt must be fully SELF-CONTAINED: repeat each character's fixed look (age, face, hair, outfit, colors), the location, the action, facial expressions, camera movement, lighting, sound/music mood, and the exact spoken dialogue with who says it. Each scene is 8 seconds. Visual style: vibrant cinematic, consistent across scenes. No text overlays inside the video.

Return ONLY JSON:
{"title":"catchy title","idea":"one-line concept","story":"2-3 sentence summary",
"characters":[{"name":"","description":"fixed appearance"}],
"scenes":[{"prompt":"full self-contained video prompt","narration":"spoken dialogue lines","caption":"short subtitle <=12 words","duration":8}] (exactly ${sceneCount}),
"thumbnail":{"headline":"max 4 words ALL CAPS","badge":"max 3 words","imagePrompt":"detailed prompt for an eye-catching thumbnail image, no text in the image"},
"youtube":{"title":"<=100 chars incl #Shorts","description":"hook + 2-3 lines + CTA","hashtags":"#a #b (5-8)","tags":"comma separated 10-15 keywords"},
"tiktok":{"title":"<=150 chars","description":"caption","hashtags":"4-6 hashtags","tags":""},
"instagram":{"title":"hook line","description":"caption with emojis and CTA","hashtags":"8-12 hashtags","tags":""},
"facebook":{"title":"title","description":"conversational caption with a question","hashtags":"3-5 hashtags","tags":""}}
Use at most 3 characters. Use #Beshaan #BeshaanVibe in hashtags when the channel is Beshaan.`;

  let data: any = null;
  let lastErr = '';
  for (let attempt = 0; attempt < 2 && !data?.scenes?.length; attempt++) {
    try {
      const r = await generateText({ prompt, json: true, maxTokens: 8000 });
      data = parseJson(r.text);
    } catch (e: any) {
      lastErr = e?.message || String(e);
    }
  }
  if (!data?.scenes?.length) throw new Error(`AI did not return a pack. ${lastErr}`);

  const seoOf = (k: string) => ({
    title: String(data[k]?.title || data.title || ''),
    description: String(data[k]?.description || ''),
    hashtags: Array.isArray(data[k]?.hashtags) ? data[k].hashtags.join(' ') : String(data[k]?.hashtags || ''),
    tags: Array.isArray(data[k]?.tags) ? data[k].tags.join(', ') : String(data[k]?.tags || ''),
  });

  const pack: IDailyPack = {
    dateKey: todayKey(),
    genre,
    title: String(data.title || 'Untitled'),
    idea: String(data.idea || ''),
    story: String(data.story || ''),
    characters: (data.characters || []).slice(0, 3).map((c: any) => ({ name: String(c.name || ''), description: String(c.description || '') })),
    scenes: data.scenes.slice(0, 15).map((s: any) => ({
      prompt: String(s.prompt || ''),
      narration: String(s.narration || ''),
      caption: String(s.caption || ''),
      duration: Math.min(15, Math.max(2, Number(s.duration) || 8)),
    })),
    thumbnail: {
      headline: String(data.thumbnail?.headline || data.title || '').toUpperCase(),
      badge: String(data.thumbnail?.badge || '').toUpperCase(),
      imagePrompt: String(data.thumbnail?.imagePrompt || ''),
    },
    seo: { youtube: seoOf('youtube'), tiktok: seoOf('tiktok'), instagram: seoOf('instagram'), facebook: seoOf('facebook') },
    status: 'new',
    source: opts.source,
  };
  const saved: any = await DailyPack.create(pack);
  return JSON.parse(JSON.stringify(saved));
}
