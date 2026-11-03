/**
 * Puter.js Integration Utility with Cascading Multi-Model Fallbacks
 * Provides client-side access to 400+ AI models (OpenAI, Claude, Gemini, DeepSeek, Llama)
 * with zero server API key maintenance using the user-pays serverless architecture.
 *
 * If any model encounters rate limits, downtime, or provider errors, the engine
 * automatically fails over to the next best model in the cascade chain.
 *
 * Documentation: https://developer.puter.com/tutorials/free-unlimited-ai-api/
 */

declare global {
  interface Window {
    puter?: any;
  }
}

export interface PuterUser {
  username?: string;
  email?: string;
  [key: string]: any;
}

export interface PuterModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
}

export const POPULAR_PUTER_MODELS: PuterModelOption[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    description: 'Flagship multimodal reasoning and viral script writing',
    badge: 'POPULAR'
  },
  {
    id: 'anthropic/claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'State-of-the-art nuanced prose, hooks, and code generation',
    badge: 'TOP TIER'
  },
  {
    id: 'google/gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Ultra-low latency with massive context analysis',
    badge: 'FASTEST'
  },
  {
    id: 'google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Complex long-document reasoning & multi-modal processing'
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Extreme logic depth and high-retention scripting'
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    description: 'Leading open weights model fine-tuned for instruction following'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Lightweight, rapid-fire completions and summaries'
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'High-precision European reasoning engine'
  }
];

// Ordered cascading fallback list if the user's primary model is unavailable
export const DEFAULT_FALLBACK_CHAIN: string[] = [
  'openai/gpt-4o',
  'anthropic/claude-3-5-sonnet',
  'google/gemini-1.5-flash',
  'deepseek/deepseek-chat',
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-large',
  'openai/gpt-4o-mini'
];

let puterLoadPromise: Promise<any> | null = null;

/**
 * Dynamically loads Puter.js in the browser if not already injected
 */
export function loadPuter(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.puter) {
    return Promise.resolve(window.puter);
  }

  if (puterLoadPromise) {
    return puterLoadPromise;
  }

  puterLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="js.puter.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.puter));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      resolve(window.puter);
    };
    script.onerror = (err) => {
      console.warn('Failed to load Puter.js script from CDN:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return puterLoadPromise;
}

export function isPuterLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.puter);
}

export async function isPuterSignedIn(): Promise<boolean> {
  try {
    const puter = await loadPuter();
    if (!puter?.auth) return false;
    return puter.auth.isSignedIn();
  } catch {
    return false;
  }
}

export async function puterSignIn(): Promise<PuterUser | null> {
  const puter = await loadPuter();
  if (!puter?.auth) throw new Error('Puter SDK is not available.');
  const user = await puter.auth.signIn();
  return user || null;
}

export async function puterSignOut(): Promise<void> {
  const puter = await loadPuter();
  if (puter?.auth) {
    await puter.auth.signOut();
  }
}

export async function puterGetUser(): Promise<PuterUser | null> {
  try {
    const puter = await loadPuter();
    if (!puter?.auth || !puter.auth.isSignedIn()) return null;
    return await puter.auth.getUser();
  } catch {
    return null;
  }
}

export interface PuterChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemPrompt?: string;
  autoFallback?: boolean; // Default true: automatically try next models if one fails
  fallbackModels?: string[]; // Custom chain of models to try
  onModelFallback?: (fromModel: string, toModel: string, error: string) => void;
}

export interface PuterChatResult {
  text: string;
  modelUsed: string;
  fallbacksAttempted: Array<{ model: string; error: string }>;
}

/**
 * Execute AI Chat using Puter.js with Automatic Multi-Model Cascading Fallback
 * If model A fails (rate limit, busy, 503), it automatically attempts model B, C, D...
 */
export async function puterChatWithDetails(
  prompt: string | Array<{ role: string; content: string }>,
  options: PuterChatOptions = {}
): Promise<PuterChatResult> {
  const puter = await loadPuter();
  if (!puter?.ai?.chat) {
    throw new Error('Puter AI engine is not initialized.');
  }

  const primaryModel = options.model || 'openai/gpt-4o';
  const autoFallback = options.autoFallback !== false;

  // Build the fallback chain: primary model first, followed by remaining unique models
  const configuredFallbacks = options.fallbackModels || DEFAULT_FALLBACK_CHAIN;
  const modelsToTry = autoFallback
    ? [primaryModel, ...configuredFallbacks.filter(m => m !== primaryModel)]
    : [primaryModel];

  let messages: any = prompt;
  if (typeof prompt === 'string') {
    if (options.systemPrompt) {
      messages = [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: prompt }
      ];
    } else {
      messages = prompt;
    }
  }

  const errors: Array<{ model: string; error: string }> = [];

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const response = await puter.ai.chat(messages, {
        model: currentModel,
        temperature: options.temperature,
        max_tokens: options.max_tokens
      });

      let textOutput = '';
      if (typeof response === 'string') {
        textOutput = response;
      } else if (response?.message?.content) {
        if (typeof response.message.content === 'string') {
          textOutput = response.message.content;
        } else if (Array.isArray(response.message.content)) {
          textOutput = response.message.content.map((c: any) => c.text || '').join('');
        }
      } else if (response?.text) {
        textOutput = response.text;
      } else {
        textOutput = JSON.stringify(response);
      }

      if (textOutput && textOutput.trim().length > 0) {
        return {
          text: textOutput,
          modelUsed: currentModel,
          fallbacksAttempted: errors
        };
      }
      throw new Error(`Empty response from model ${currentModel}`);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      errors.push({ model: currentModel, error: errMsg });

      const nextModel = modelsToTry[i + 1];
      if (nextModel) {
        console.warn(`[Puter AI Fallback] Model "${currentModel}" failed (${errMsg}). Cascading to next model: "${nextModel}"...`);
        if (options.onModelFallback) {
          try {
            options.onModelFallback(currentModel, nextModel, errMsg);
          } catch (_) {}
        }
      }
    }
  }

  // All models in the chain failed
  const errorSummary = errors.map(e => `[${e.model}: ${e.error}]`).join(', ');
  throw new Error(`All ${modelsToTry.length} Puter AI models failed: ${errorSummary}`);
}

/**
 * Standard puterChat returns the text directly while retaining automatic cascading fallback
 */
export async function puterChat(
  prompt: string | Array<{ role: string; content: string }>,
  options: PuterChatOptions = {}
): Promise<string> {
  const result = await puterChatWithDetails(prompt, options);
  return result.text;
}

/**
 * Generate AI image using Puter.js
 */
export async function puterTxt2Img(prompt: string, model?: string): Promise<HTMLImageElement | string> {
  const puter = await loadPuter();
  if (!puter?.ai?.txt2img) {
    throw new Error('Puter txt2img is not available');
  }
  const result = await puter.ai.txt2img(prompt, model ? { model } : undefined);
  return result;
}

/**
 * List all available models dynamically from Puter
 */
export async function puterListModels(): Promise<any[]> {
  try {
    const puter = await loadPuter();
    if (puter?.ai?.listModels) {
      return await puter.ai.listModels();
    }
  } catch (e) {
    console.warn('puter.ai.listModels failed, falling back to static list:', e);
  }
  return POPULAR_PUTER_MODELS;
}
