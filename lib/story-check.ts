/**
 * The "Quick Checklist" of the Easy Reel Script Guide, applied to every story the studio writes:
 * the story is written with these five rules, then checked against them, and fixed once if one is not met.
 */

export const STORY_CHECKS = [
  { key: 'hook', label: 'Is the hook interesting?', rule: 'Something interesting or surprising happens in the first 3 seconds, so a viewer stops scrolling (no fake shock, no clickbait).' },
  { key: 'problem', label: 'Is the problem clear?', rule: 'ONE real, relatable everyday problem that a viewer of any age recognises from their own life.' },
  { key: 'solution', label: 'Is the solution useful?', rule: 'The turning point is one practical thing a viewer can really do in their own life, not a vague moral.' },
  { key: 'result', label: 'Is the result or benefit clear?', rule: 'The ending visibly shows what changed because of the solution, and what the viewer gains. Nothing is promised that cannot be true.' },
  { key: 'simple', label: 'Is it simple (one message)?', rule: 'One story = one main message that can be retold in one sentence, said at the end in short natural words.' },
] as const;

export type StoryCheck = { key: string; label: string; ok: boolean; note: string };

/** The five rules as text for the writing prompt. */
export const STORY_CHECK_RULES = `QUALITY CHECKLIST (the story is checked against it afterwards):\n${STORY_CHECKS.map((c, i) => `${i + 1}. ${c.label} ${c.rule}`).join('\n')}`;

export function reviewPrompt(story: { title: string; story: string; lesson: string; beats: string[] }) {
  const system = 'You are a strict story editor for short videos. Reply with ONLY valid JSON, no markdown.';
  const user = `Check this short story against the five checks. Be honest: say ok=false when a check is not clearly met, and give ONE short fix for it.
${STORY_CHECKS.map((c) => `- ${c.key}: ${c.rule}`).join('\n')}

TITLE: ${story.title}
STORY: ${story.story}
LESSON: ${story.lesson}
BEATS:
${story.beats.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return ONLY JSON: {"hook":{"ok":true,"fix":""},"problem":{"ok":true,"fix":""},"solution":{"ok":true,"fix":""},"result":{"ok":true,"fix":""},"simple":{"ok":true,"fix":""}}`;
  return { system, user };
}

/** Turns the editor's answer into five checks. Anything missing counts as "not confirmed" (ok = false). */
export function normalizeChecks(raw: any): StoryCheck[] {
  return STORY_CHECKS.map((c) => {
    const r = raw?.[c.key];
    return { key: c.key, label: c.label, ok: r?.ok === true, note: r?.ok === true ? '' : String(r?.fix || 'Not confirmed').trim() };
  });
}

export const failedChecks = (checks: StoryCheck[] | null | undefined) => (checks || []).filter((c) => !c.ok);
