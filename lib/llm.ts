import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiKey = () => process.env.GEMINI_API_KEY || '';
export const getGroqKey = () => process.env.GROQ_API_KEY || '';

/**
 * Server-side text generation with automatic fallback between Groq (free, ~30 req/min) and Gemini.
 * Order: Groq first, then Gemini (`prefer: 'gemini'` swaps it: Gemini writes better Urdu / Roman Urdu stories).
 * Env: GROQ_API_KEY, optional GROQ_MODEL; GEMINI_API_KEY, optional GEMINI_MODEL.
 *
 * Every attempt has a time limit (`timeoutMs`), and the whole call has a budget (`budgetMs`), so a model that hangs
 * can never block the request: the next model is tried, and the call ends before the host's own time limit (60 s).
 */
export async function generateText(opts: {
  system?: string;
  prompt: string;
  json?: boolean;
  maxTokens?: number;
  timeoutMs?: number;
  budgetMs?: number;
  /** 1 = loose and creative (default); lower = more careful and consistent. */
  temperature?: number;
  /** how much the model thinks before it answers (gpt-oss models): 'low' is fastest, 'medium' writes more logical stories. */
  reasoning?: 'low' | 'medium';
  prefer?: 'groq' | 'gemini';
}): Promise<{ text: string; provider: string }> {
  const errors: string[] = [];
  const started = Date.now();
  const budget = opts.budgetMs ?? 50_000;
  const left = () => budget - (Date.now() - started);
  // time for the next attempt: the per-attempt limit, but never more than what is left of the budget
  const attemptMs = () => Math.min(opts.timeoutMs ?? 20_000, left());
  const MIN_LEFT = 3_000;

  const groqKey = getGroqKey();
  const geminiKey = getGeminiKey();

  const tryGroq = async (): Promise<{ text: string; provider: string } | null> => {
    if (!groqKey) return null;
    const models = (process.env.GROQ_MODEL ? [process.env.GROQ_MODEL] : []).concat(['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b']);
    for (const model of models) {
      if (left() < MIN_LEFT) break;
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), attemptMs());
      try {
        const body: Record<string, unknown> = {
          model,
          messages: [
            ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
            { role: 'user', content: opts.prompt },
          ],
          max_tokens: opts.maxTokens || 8000,
          temperature: opts.temperature ?? 1,
        };
        if (model.startsWith('openai/gpt-oss')) body.reasoning_effort = opts.reasoning || 'low';
        if (opts.json) body.response_format = { type: 'json_object' };
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify(body),
          signal: ctl.signal,
        });
        const j: any = await res.json().catch(() => ({}));
        const text: string | undefined = j?.choices?.[0]?.message?.content;
        if (res.ok && text && text.trim()) return { text, provider: `groq:${model}` };
        errors.push(`Groq ${model}: ${j?.error?.message || res.status}`);
        if (res.status === 401) break; // wrong key: no point trying other models
      } catch (e: any) {
        errors.push(`Groq ${model}: ${ctl.signal.aborted ? 'took too long, trying the next model' : e?.message}`);
      } finally {
        clearTimeout(timer);
      }
    }
    return null;
  };

  const tryGemini = async (): Promise<{ text: string; provider: string } | null> => {
    if (!geminiKey) return null;
    const genAI = new GoogleGenerativeAI(geminiKey);
    const models = (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []).concat(['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash']);
    // when Gemini goes first it gets ONE try of at most 20 s, so Groq always keeps at least 30 s of the budget
    for (const name of opts.prefer === 'gemini' ? models.slice(0, 1) : models) {
      if (left() < MIN_LEFT) break;
      try {
        const model = genAI.getGenerativeModel(
          {
            model: name,
            systemInstruction: opts.system,
            generationConfig: { temperature: opts.temperature ?? 1, maxOutputTokens: 8192, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
          },
          { timeout: opts.prefer === 'gemini' ? Math.min(attemptMs(), 20_000) : attemptMs() }
        );
        const res = await model.generateContent(opts.prompt);
        const text = res.response.text();
        if (text && text.trim()) return { text, provider: `gemini:${name}` };
        errors.push(`Gemini ${name}: empty`);
      } catch (e: any) {
        errors.push(`Gemini ${name}: ${e?.message || e}`);
      }
    }
    return null;
  };

  const order = opts.prefer === 'gemini' ? [tryGemini, tryGroq] : [tryGroq, tryGemini];
  for (const run of order) {
    const r = await run();
    if (r) return r;
  }

  if (!groqKey && !geminiKey) throw new Error('No AI key configured. Set GROQ_API_KEY (console.groq.com) and/or GEMINI_API_KEY.');
  if (left() < MIN_LEFT) errors.push('out of time');
  throw new Error(errors.slice(-3).join(' | '));
}
