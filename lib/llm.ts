import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiKey = () => process.env.GEMINI_API_KEY || '';
export const getGroqKey = () => process.env.GROQ_API_KEY || '';

/**
 * Server-side text generation with automatic fallback: Groq (free, ~30 req/min) first, then Gemini.
 * Env: GROQ_API_KEY, optional GROQ_MODEL; GEMINI_API_KEY, optional GEMINI_MODEL.
 */
export async function generateText(opts: { system?: string; prompt: string; json?: boolean; maxTokens?: number }): Promise<{ text: string; provider: string }> {
  const errors: string[] = [];

  const groqKey = getGroqKey();
  if (groqKey) {
    const models = (process.env.GROQ_MODEL ? [process.env.GROQ_MODEL] : []).concat(['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b']);
    for (const model of models) {
      try {
        const body: Record<string, unknown> = {
          model,
          messages: [
            ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
            { role: 'user', content: opts.prompt },
          ],
          max_tokens: opts.maxTokens || 8000,
          temperature: 1,
        };
        if (model.startsWith('openai/gpt-oss')) body.reasoning_effort = 'low';
        if (opts.json) body.response_format = { type: 'json_object' };
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify(body),
        });
        const j: any = await res.json().catch(() => ({}));
        const text: string | undefined = j?.choices?.[0]?.message?.content;
        if (res.ok && text && text.trim()) return { text, provider: `groq:${model}` };
        errors.push(`Groq ${model}: ${j?.error?.message || res.status}`);
        if (res.status === 401) break; // wrong key: no point trying other models
      } catch (e: any) {
        errors.push(`Groq ${model}: ${e?.message}`);
      }
    }
  }

  const geminiKey = getGeminiKey();
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const models = (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []).concat(['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash']);
    for (const name of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: name,
          systemInstruction: opts.system,
          generationConfig: { temperature: 1, maxOutputTokens: 8192, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
        });
        const res = await model.generateContent(opts.prompt);
        const text = res.response.text();
        if (text && text.trim()) return { text, provider: `gemini:${name}` };
        errors.push(`Gemini ${name}: empty`);
      } catch (e: any) {
        errors.push(`Gemini ${name}: ${e?.message || e}`);
      }
    }
  }

  if (!groqKey && !geminiKey) throw new Error('No AI key configured. Set GROQ_API_KEY (console.groq.com) and/or GEMINI_API_KEY.');
  throw new Error(errors.slice(-3).join(' | '));
}
