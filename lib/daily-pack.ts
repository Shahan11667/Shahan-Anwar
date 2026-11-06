import { generateText } from '@/lib/llm';
import DailyPack, { IDailyPack } from '@/models/DailyPack';
import { ANGLES, BESHAAN, DIALOGUE_RULES, FOCUS_THEMES, HEART_HASHTAGS, arcFor, LANG_LABEL, focusesOf, isBeshaan, isHeart, storyContext } from '@/lib/beshaan';

export function todayKey(): string {
  // Pakistan time (UTC+5) so "today" matches the creator's day
  return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

function parseJson(text: string): any {
  const t = text.replace(/```json|```/gi, '');
  return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
}

type Recent = { title?: string; idea?: string; focus?: string; theme?: string };

/**
 * Picks the topic and theme for a new pack so days do not repeat:
 * - topic: the one used least in the last 8 packs (DAILY_PACK_FOCUS overrides it),
 * - theme: one that was not used in the last packs (the list is long enough to never run out quickly).
 */
function chooseTopicAndTheme(recent: Recent[], genre: string): { focus: string; theme: string } {
  const focuses = focusesOf(genre);
  if (!focuses.length) {
    const fresh = ANGLES.filter((t) => !recent.slice(0, ANGLES.length - 4).some((r) => r.theme === t));
    const pool = fresh.length ? fresh : ANGLES;
    return { focus: genre, theme: pool[Math.floor(Math.random() * pool.length)] };
  }
  const env = process.env.DAILY_PACK_FOCUS || '';
  const used = (f: string) => recent.slice(0, 8).filter((r) => r.focus === f).length;
  const focus = focuses.includes(env) ? env : [...focuses].sort((a, b) => used(a) - used(b))[0];
  const pool = FOCUS_THEMES[focus];
  const usedThemes = new Set(recent.slice(0, Math.max(0, pool.length - 4)).map((r) => r.theme));
  const fresh = pool.filter((t) => !usedThemes.has(t));
  const options = fresh.length ? fresh : pool;
  return { focus, theme: options[Math.floor(Math.random() * options.length)] };
}

export async function generatePack(opts: { source: 'cron' | 'manual'; hint?: string }): Promise<IDailyPack> {
  const sceneCount = Math.min(12, Math.max(3, Number(process.env.DAILY_PACK_SCENES) || 7));
  const langKey = (process.env.DAILY_PACK_LANGUAGE || 'roman_urdu') as keyof typeof LANG_LABEL;
  const language = LANG_LABEL[langKey] || LANG_LABEL.roman_urdu;
  const genre = process.env.DAILY_PACK_GENRE || BESHAAN;

  const recent = (await DailyPack.find({}).sort({ createdAt: -1 }).limit(60).select('title idea focus theme').lean()) as Recent[];
  const { focus, theme } = chooseTopicAndTheme(recent, genre);
  // The full ideas of the last 40 packs, so the AI does not write the same situation or lesson again
  const avoid = recent
    .slice(0, 40)
    .map((r) => (r.idea || r.title || '').slice(0, 160))
    .filter(Boolean)
    .join(' | ')
    .slice(0, 4000);

  const prompt = `${storyContext(genre, focus)}
Create ONE complete, ready-to-produce short video package for today (vertical 9:16, about ${sceneCount * 8} seconds).
TODAY'S THEME (the heart of the story, use it): ${theme}.
${opts.hint ? `Creator's hint: ${opts.hint}\n` : ''}Do NOT repeat or closely copy these earlier videos (same situation, same twist or same lesson): ${avoid || '(none yet)'}.
Dialogue/narration/captions language: ${language}. ${DIALOGUE_RULES}

The scenes will be pasted one by one into Google Flow / Veo (an AI video generator), each in a separate generation. So EVERY scene prompt must be fully SELF-CONTAINED: repeat each character's fixed look (age, face, hair, outfit, colors), the location, the action, facial expressions, camera movement, lighting, sound/music mood, and the exact spoken dialogue with who says it. Each scene is 8 seconds. Visual style: vibrant cinematic, consistent across scenes. No text overlays inside the video.

CONNECTED STORY (very important): write the "beats" BEFORE the scenes and follow them exactly.
- ${arcFor(sceneCount)} The lesson is said naturally by a character.
- Every beat is caused by the one before it. No random jumps, no new unrelated characters or events.
- ONE main location for the whole video, the same time of day, and the SAME outfit for every character in every scene.
- Scene N starts exactly where scene N-1 ended (same place, same outfits, same positions) and its first spoken line reacts to the last line of the previous scene.

Return ONLY JSON:
{"title":"catchy title","idea":"one-line concept","story":"2-3 sentence summary ending with: Lesson: <the lesson>",
"characters":[{"name":"","description":"fixed appearance including the outfit worn in the whole video"}],
"continuity":{"setting":"the main location in detail, time of day","props":"important objects"},
"beats":[{"what":"what happens","endsWith":"the exact last moment of that clip (positions, expressions, last spoken line)"}] (exactly ${sceneCount}),
"scenes":[{"prompt":"full self-contained video prompt","narration":"spoken dialogue lines","caption":"short subtitle <=12 words","duration":8}] (exactly ${sceneCount}),
"thumbnail":{"headline":"max 4 words ALL CAPS","badge":"max 3 words","imagePrompt":"detailed prompt for an eye-catching thumbnail image, no text in the image"},
"seo":{"title":"<=100 chars, keyword first, include #Shorts","description":"hook + 2-3 lines + a question + CTA","hashtags":"8-12 hashtags separated by spaces"}}
Use at most 3 characters.${isBeshaan(genre) ? ' Use #Beshaan #BeshaanVibe in the hashtags.' : ''}${isHeart(genre) ? ` Use these hashtags among the others: ${HEART_HASHTAGS}.` : ''}`;

  let data: any = null;
  let lastErr = '';
  for (let attempt = 0; attempt < 2 && !data?.scenes?.length; attempt++) {
    try {
      // one long answer (all scenes at once): allow more time per attempt than the interactive studio
      const r = await generateText({ prompt, json: true, maxTokens: 8000, timeoutMs: 45_000, budgetMs: 55_000 });
      data = parseJson(r.text);
    } catch (e: any) {
      lastErr = e?.message || String(e);
    }
  }
  if (!data?.scenes?.length) throw new Error(`AI did not return a pack. ${lastErr}`);

  const pack: IDailyPack = {
    dateKey: todayKey(),
    genre,
    focus,
    theme,
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
    // one title / description / hashtags for every platform (each platform cuts it to its own length when posting)
    seo: {
      title: String(data.seo?.title || data.title || ''),
      description: String(data.seo?.description || ''),
      hashtags: Array.isArray(data.seo?.hashtags) ? data.seo.hashtags.join(' ') : String(data.seo?.hashtags || ''),
    },
    status: 'new',
    source: opts.source,
  };
  const saved: any = await DailyPack.create(pack);
  return JSON.parse(JSON.stringify(saved));
}
