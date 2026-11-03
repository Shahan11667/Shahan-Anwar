import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export interface CharacterDialogue {
  character: string;
  emotion: string;
  text: string;
}

export interface SceneItem {
  sceneNumber: number;
  partNumber?: number;
  partTitle?: string;
  durationSeconds: number;
  visualPrompt: string;
  voiceoverText: string;
  onScreenCaption: string;
  soundEffect: string;
  brollKeyword: string;
  aiVideoPrompt?: string;
  dialogues?: CharacterDialogue[];
  actionSummary?: string;
}

export interface StoryPart {
  partNumber: number;
  partTitle: string;
  hook?: string;
  scenes: SceneItem[];
}

export interface VideoAutomationResult {
  titleOptions: string[];
  selectedTitle: string;
  niche: string;
  channelName?: string;
  targetFormat: 'shorts_9_16' | 'video_16_9';
  totalDurationSeconds: number;
  seriesParts?: number;
  storyParts?: StoryPart[];
  scenes: SceneItem[];
  description: string;
  hashtags: string[];
  tags: string[];
  thumbnailConcept: {
    mainHeadline: string;
    badgeText: string;
    bgColor: string;
  };
}

// Bisma Reference AI Video Prompt Builder (10 Seconds Kling/Runway Format)
export function buildProductionAiVideoPrompt({
  style = 'cinematic anime-style',
  sceneDescription,
  dialogues = [],
  actionSummary,
  aspectRatio = '9:16',
  durationSeconds = 10,
  referenceImageNote = 'based on the reference image'
}: {
  style?: string;
  sceneDescription: string;
  dialogues?: CharacterDialogue[];
  actionSummary?: string;
  aspectRatio?: string;
  durationSeconds?: number;
  referenceImageNote?: string;
}): string {
  let prompt = `AI Video Prompt (${durationSeconds} Seconds) ❤️🥹\n\n`;
  prompt += `Create a beautiful, emotional, ${style} AI video ${referenceImageNote}. ${sceneDescription.trim()}\n\n`;

  if (dialogues && dialogues.length > 0) {
    prompt += `Dialogue:\n\n`;
    dialogues.forEach(d => {
      prompt += `${d.character} (${d.emotion}): “${d.text}”\n\n`;
    });
  }

  const ending = actionSummary || 'The girl blushes and smiles, and the boy gently holds her hand. End with both smiling at each other.';
  prompt += `${ending} Soft romantic background music, natural facial expressions, smooth animation, warm golden lighting, vertical ${aspectRatio} format, high-quality visuals, ${durationSeconds} seconds long. Keep the characters consistent with the reference image. Ensure both dialogues are spoken clearly with accurate lip-sync.`;

  return prompt;
}

export interface GeneratedTopicItem {
  id: string;
  title: string;
  hook: string;
  niche: string;
  format: 'shorts_9_16' | 'video_16_9';
  estimatedDuration: number;
  viralScore: number;
  badge: string;
}

// Multi-Niche Topic Banks for Autonomous Topic Self-Generation
const NICHE_TOPIC_BANKS: Record<string, Array<{ title: string; hook: string; badge: string }>> = {
  romantic_anime: [
    { title: 'University Floor Promise: The 10-Second Anime Love Story ❤️', hook: 'A cute girl in lavender looks shyly into his eyes on the floor: "Agar hum dur ho gaye toh bhool toh nahi jaoge?"', badge: 'ANIME ROMANCE' },
    { title: 'The Lavender Ribbon: A Promise Across 5 Years 🎀', hook: 'She tied her lavender ribbon on his wrist before leaving. 5 years later, he is still wearing it.', badge: 'ETERNAL LOVE' },
    { title: 'Rainy Umbrella Confession Under the Thunderstorm 🌧️', hook: 'Standing at the bus stop, he quietly tilts his umbrella over her shoulder with a gentle smile.', badge: 'HEART TOUCHING' },
    { title: 'Golden Hour Classroom Confession (3-Year Secret) 🌅', hook: 'Warm golden rays stream through the windows as he whispers what he kept hidden in his diary.', badge: 'SWEET EMOTIONS' },
  ],
  beshaan_trio: [
    { title: 'Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya! (Two Girls vs One Boy Challenge) 🎀', hook: 'Kiska style sabse best hai? Aap heran reh jaoge is larke ne oversized blazer kaise pehna!', badge: 'FASHION BATTLE' },
    { title: 'Sasti Street Shopping: Luxury Looks Under 5,000 PKR 🛍️', hook: 'Kya hum teeno 5000 rupay ke budget me luxury model ban sakte hain? Transformation dekho!', badge: 'BUDGET STYLE' },
    { title: 'Two Girls vs One Boy 1v1 Gaming Battle (Haarne Wale Ko Cake Ka Saza!) 🎮', hook: 'Isne bola tha ke ye hum dono ko aankh band karke hara sakta hai. Karma dekho zara!', badge: 'GAMING CHAOS' },
    { title: 'Who Knows Each Other Best? Trio Best Friend Quiz (Raaz Khul Gaye) 🤫', hook: 'Jo sawal ka galat jawab dega, usko apna sabse embarrassing camera roll photo dikhana padega!', badge: 'TRIO SECRETS' },
    { title: 'The 3-Minute Glow Up Challenge Vlog Recording Se Pehle 🌸', hook: 'Teen log, ek mirror, aur sirf 3 minute me ready hona hai. Poora hungama mach gaya!', badge: 'GLOW UP RUSH' },
    { title: 'Raat Ke 3 Baje Horror Game Khelne Ka Nateeja 👻', hook: 'Poore 2026 ki sabse cheekh nikalne wali cheekh sirf 12 seconds me nikal gayi!', badge: 'HORROR GAMING' },
    { title: 'Larke Ne Hamara Full Makeup Kiya (Bohot Bura Haal Hua) 💄', hook: 'Isko lagta tha contouring bas line kheenchne ka naam hai. Final eyeliner dekho zara!', badge: 'MAKEUP SWAP' },
    { title: '24 Ghante Har Cheez Ko YES Bolne Ka Challenge ⚡', hook: 'Rule number one: chahe ye jo bhi outfit ya game bole, NO kehna mana hai!', badge: '24HR YES' }
  ],
  ai_tech: [
    { title: '3 Local AI Models That Run on Any Laptop Without GPU', hook: 'Stop paying $20/month for cloud AI when these 3 run 100% offline.', badge: 'OFFLINE AI' },
    { title: 'The Autonomous Agent Pipeline That Replaced 4 Junior Devs', hook: 'Here is the exact multi-agent architecture top engineering teams use in 2026.', badge: 'AGENT SWARMS' },
    { title: 'How to Build a Full-Stack Micro-SaaS with Cursor in 3 Hours', hook: 'From empty folder to deployed Stripe checkout in one sitting.', badge: '3-HOUR SAAS' },
    { title: 'Why Vector Databases Are Being Replaced by 10M Context Windows', hook: 'The RAG architecture everyone spent millions building might already be obsolete.', badge: 'BIG TECH SHIFT' },
    { title: '5 Secret Open-Source GitHub Repos Trending Right Now', hook: 'These 5 repos have 50,000 stars for a reason, but nobody on YouTube talks about them.', badge: 'GITHUB SECRETS' },
    { title: 'Build a Self-Correcting AI Web Scraper That Never Gets Blocked', hook: 'How modern scrapers bypass Cloudflare and auto-repair broken selectors.', badge: 'AUTO-SCRAPE' },
  ],
  wealth_business: [
    { title: 'The $10,000/Month Zero-Employee Software Business Model', hook: 'How solo developers are printing five figures monthly using single-purpose micro-tools.', badge: 'SOLO SAAS' },
    { title: 'How to Validate Any Digital Product Before Writing a Line of Code', hook: 'Stop spending 6 months building something nobody wants. Do this 48-hour test first.', badge: 'ZERO RISK' },
    { title: '3 High-Margin Digital Assets You Can Build Once and Sell Forever', hook: 'Trading time for money is a trap. Here are 3 assets that pay you while you sleep.', badge: 'PASSIVE CASH' },
    { title: 'Why 99% of Freelancers Stay Broke (And the 1% Retainer Secret)', hook: 'Hourly billing keeps you poor. Transitioning to productized retainers is the cheat code.', badge: 'PRICING HACK' },
    { title: 'The Micro-Acquisition Strategy: Buying $500/Mo Cash Flow Tools', hook: 'You do not need to build from scratch. People are selling profitable micro-apps right now.', badge: 'MICRO BUYOUT' },
  ],
  dark_psychology: [
    { title: 'The 3-Second Eye Contact Technique Used by World Leaders', hook: 'Notice where their eyes dart when you pause? Here is what high-status communicators do.', badge: 'POWER DYNAMICS' },
    { title: 'How to Detect a Lie in Under 10 Seconds Using Vocal Cadence', hook: 'Liars almost always make this one unconscious grammatical shift in tone.', badge: 'LIE DETECTOR' },
    { title: 'The Pratfall Effect: Why Perfect People Are Least Trusted', hook: 'Revealing one calculated flaw makes people 80% more likely to buy from you.', badge: 'MIND TRICKS' },
    { title: 'The Silence Rule: How Negotiators Win by Saying Nothing', hook: 'When someone gives you a bad offer, never argue. Use the 7-second dead silence trick.', badge: 'NEGOTIATION' },
    { title: 'Spotting Covert Manipulation: The Move Nobody Warns You About', hook: 'If someone uses this passive-aggressive praise technique, protect your boundaries immediately.', badge: 'SHIELD UP' },
  ],
  stoicism_mindset: [
    { title: 'The 24-Hour Dopamine Reset That Restores Laser Focus', hook: 'If you feel chronically unmotivated and brain-fogged, your baseline dopamine is fried.', badge: 'DOPAMINE HEAL' },
    { title: 'Marcus Aurelius on Dealing with Difficult People (4 Rules)', hook: 'You cannot control how toxic people act, but you have 100% control over your reaction.', badge: 'STOIC SHIELD' },
    { title: 'The 2-Minute Rule to Destroy Chronic Procrastination Forever', hook: 'Overthinking is an emotional regulation problem, not a time management problem.', badge: 'ACTION FIRST' },
    { title: 'Emotional Detachment: The Superpower of the 1% Elite', hook: 'When you stop reacting emotionally to minor setbacks, nobody can control you.', badge: 'UNSHAKEABLE' },
    { title: 'Why Waiting to Feel Motivated is Keeping You Trapped', hook: 'Amateurs wait for inspiration. Professionals show up on schedule regardless of feelings.', badge: 'DISCIPLINE' },
  ],
  science_space: [
    { title: 'What Actually Happens to Time When You Approach a Black Hole', hook: 'One hour near Sagittarius A* would equal 7 years on Earth. Here is the terrifying physics.', badge: 'RELATIVITY' },
    { title: 'The Dark Forest Theory: Why the Universe is Completely Silent', hook: 'The terrifying answer to the Fermi Paradox that keeps astrophysicists awake at night.', badge: 'COSMIC DREAD' },
    { title: 'Scientists Just Discovered Water in a Place That Defies Physics', hook: 'James Webb telescope just peered inside an ancient galaxy and found something impossible.', badge: 'JWST BREAKTHROUGH' },
    { title: 'What Lies Beneath the Ice of Jupiter’s Moon Europa', hook: 'There is a liquid ocean twice the volume of Earth’s oceans hidden right in our solar system.', badge: 'ALIEN OCEANS' },
  ],
  mystery_facts: [
    { title: 'The Billion-Dollar Typo That Almost Crashed Wall Street', hook: 'In 2005, a trader tried to sell 1 share for 610,000 yen. He typed 610,000 shares for 1 yen.', badge: 'FAT FINGER' },
    { title: 'The Secret Bunker Hidden Under a 5-Star Luxury Resort for 30 Years', hook: 'For three decades, tourists played golf directly above a top-secret congressional bunker.', badge: 'GOVT SECRETS' },
    { title: 'How One Man Legally Bankrupted an Airline with a Lifetime Pass', hook: 'In 1987, American Airlines sold unlimited first-class tickets for $250,000. It cost them millions.', badge: 'LOOPHOLE LEGEND' },
    { title: 'The Unsolved Voynich Manuscript: Century of Failed Decryptions', hook: 'A 600-year-old book written in an alien script that even modern supercomputers cannot crack.', badge: 'UNSOLVED' }
  ]
};

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { 
      action = 'generate_script', // 'generate_script' | 'generate_topics'
      niche = 'beshaan_trio', 
      customPrompt = '', 
      channelName = 'Beshaan',
      channelTone = 'Energetic Trio Banter, Trendy Fashion Styling & Gaming Hype',
      targetFormat = 'shorts_9_16', 
      duration = 35,
      language = 'roman_urdu',
      seriesParts: rawSeriesParts,
      visualStyle: userVisualStyle,
      apiKey: userApiKey
    } = body || {};

    const rawNumParts = Number(rawSeriesParts);
    const seriesParts = (rawNumParts === 5 || rawNumParts === 10) ? rawNumParts : 1;
    const visualStyle = typeof userVisualStyle === 'string' && userVisualStyle.trim() 
      ? userVisualStyle.trim() 
      : (niche === 'romantic_anime' ? 'cinematic anime-style' : 'cinematic photorealistic 8k');

    // Defensive Sanitization for Worst-Case Inputs
    const safeDuration = (typeof duration === 'number' && !isNaN(duration) && duration >= 10 && duration <= 600) ? Math.round(duration) : 35;
    const safePrompt = typeof customPrompt === 'string' ? customPrompt.slice(0, 5000).trim() : '';
    const safeChannelName = typeof channelName === 'string' && channelName.trim() ? channelName.slice(0, 100) : 'Beshaan';
    const safeNiche = typeof niche === 'string' && niche.trim() ? niche : 'beshaan_trio';
    const safeLanguage: 'roman_urdu' | 'english' | 'urdu' = (language === 'english' || language === 'urdu') ? language : 'roman_urdu';
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    // =========================================================================
    // ACTION 1: SELF-GENERATE FRESH CHANNEL TOPICS
    // =========================================================================
    if (action === 'generate_topics') {
      const rawCount = Number(body?.count);
      const count = (!isNaN(rawCount) && rawCount >= 1) ? Math.min(25, Math.floor(rawCount)) : 5;
      
      // If Gemini API is available, generate fresh creative topics tailored to channel (with multi-model fallback)
      if (apiKey) {
        const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];
        for (const modelName of candidateModels) {
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      title: { type: SchemaType.STRING },
                      hook: { type: SchemaType.STRING },
                      badge: { type: SchemaType.STRING },
                      viralScore: { type: SchemaType.NUMBER }
                    },
                    required: ['title', 'hook', 'badge', 'viralScore']
                  }
                }
              }
            });

            const topicLangInstruction = safeLanguage === 'roman_urdu'
              ? 'LANGUAGE: Generate all titles and hooks in conversational ROMAN URDU (Urdu language written in Latin/English alphabets, popular with Pakistani vloggers and YouTube creators, e.g. "Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya", "Larke Ne Hamara Makeup Kiya", etc.).'
              : safeLanguage === 'urdu'
              ? 'LANGUAGE: Generate all titles and hooks in authentic Urdu script (اردو).'
              : 'LANGUAGE: English.';

            const prompt = `You are a viral YouTube Shorts and Instagram Reels strategist.
Generate ${count} completely unique, high-retention, click-worthy video topics for:
Channel Name: "${channelName}"
Niche: ${niche}
Tone: ${channelTone}
${topicLangInstruction}
Avoid generic cliches. Focus on controversial, curiosity-inducing, contrarian, or practical value hooks.`;

            const result = await model.generateContent(prompt);
            const parsed = JSON.parse(result.response.text());

            const generatedTopics: GeneratedTopicItem[] = parsed.map((item: any, idx: number) => ({
              id: `top_${Date.now()}_${idx}`,
              title: item.title,
              hook: item.hook,
              badge: item.badge?.toUpperCase() || 'VIRAL HOOK',
              niche: niche,
              format: targetFormat,
              estimatedDuration: 35,
              viralScore: item.viralScore || (90 + (idx % 9))
            }));

            return NextResponse.json({
              success: true,
              source: 'gemini-ai',
              modelUsed: modelName,
              channelName,
              niche,
              topics: generatedTopics
            });
          } catch (e: any) {
            console.warn(`Gemini model ${modelName} failed (${e.message}), trying next candidate...`);
          }
        }
      }

      // Algorithmic Self-Generated Topics across various niches
      const bank = NICHE_TOPIC_BANKS[niche] || NICHE_TOPIC_BANKS['ai_tech'];
      const shuffled = [...bank].sort(() => 0.5 - Math.random());
      
      // Add custom variants if needed
      const topics: GeneratedTopicItem[] = shuffled.slice(0, count).map((item, idx) => ({
        id: `topic_${Date.now()}_${idx}`,
        title: item.title,
        hook: item.hook,
        badge: item.badge,
        niche: niche,
        format: targetFormat,
        estimatedDuration: 35,
        viralScore: 92 + Math.floor(Math.random() * 8)
      }));

      return NextResponse.json({
        success: true,
        source: 'algorithmic-curator',
        channelName,
        niche,
        topics
      });
    }

    // =========================================================================
    // ACTION 2: GENERATE SCENE-BY-SCENE VIDEO SCRIPT (With Multi-Model Fallback)
    // =========================================================================
    if (apiKey) {
      const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];
      for (const modelName of candidateModels) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                  titleOptions: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: '3 ultra high-CTR viral clickbait titles'
                  },
                  selectedTitle: { type: SchemaType.STRING },
                  scenes: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        sceneNumber: { type: SchemaType.NUMBER },
                        partNumber: { type: SchemaType.NUMBER },
                        partTitle: { type: SchemaType.STRING },
                        durationSeconds: { type: SchemaType.NUMBER },
                        visualPrompt: { type: SchemaType.STRING, description: 'Visual prompt for image/video generation' },
                        voiceoverText: { type: SchemaType.STRING, description: 'Spoken narration script' },
                        onScreenCaption: { type: SchemaType.STRING, description: 'Punchy 3-5 word on-screen caption' },
                        soundEffect: { type: SchemaType.STRING, description: 'SFX cue like Whoosh, Boom, Ding' },
                        brollKeyword: { type: SchemaType.STRING, description: 'Stock footage search keyword' },
                        aiVideoPrompt: { type: SchemaType.STRING, description: 'Complete 10-second AI Video Prompt with character dialogues and lip sync' }
                      },
                      required: ['sceneNumber', 'durationSeconds', 'visualPrompt', 'voiceoverText', 'onScreenCaption', 'soundEffect', 'brollKeyword']
                    }
                  },
                  description: { type: SchemaType.STRING },
                  hashtags: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                  },
                  tags: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                  },
                  thumbnailConcept: {
                    type: SchemaType.OBJECT,
                    properties: {
                      mainHeadline: { type: SchemaType.STRING },
                      badgeText: { type: SchemaType.STRING },
                      bgColor: { type: SchemaType.STRING }
                    },
                    required: ['mainHeadline', 'badgeText', 'bgColor']
                  }
                },
                required: ['titleOptions', 'selectedTitle', 'scenes', 'description', 'hashtags', 'tags', 'thumbnailConcept']
              }
            }
          });

          const scriptLangInstruction = safeLanguage === 'roman_urdu'
            ? `CRITICAL LANGUAGE REQUIREMENT:
- Write ALL "voiceoverText" in authentic, conversational ROMAN URDU (Urdu written in Latin/English alphabets, e.g. "Agar hum kabhi kisi waja sy dur ho gay, toh kya tum mujhe bhool toh nahi jao ge?", "Kabhi nahi! Tum meri zindagi ki woh pyari si yaad ho...").
- Write "onScreenCaption" in punchy Roman Urdu or mixed Roman Urdu pop buzzwords (e.g. "KABHI NAHI BHOOLUNGA 🥹❤️", "HAMARA WADA 🎀", "ASLI TWIST DEKHO 😱").
- Write "titleOptions" and "selectedTitle" in catchy Roman Urdu with emojis.
- Write "description" in Roman Urdu with relevant channel hashtags.
- Keep "visualPrompt" and "brollKeyword" in clear descriptive English for image/video generation.`
            : safeLanguage === 'urdu'
            ? `CRITICAL LANGUAGE REQUIREMENT:
- Write ALL "voiceoverText", "onScreenCaption", "titleOptions", and "description" in authentic Urdu script (اردو).
- Keep "visualPrompt" and "brollKeyword" in clear descriptive English.`
            : `Write all voiceoverText and captions in high-retention English.`;

          const prompt = `You are an elite AI Video Creator & Story Arc Director.
Channel: "${safeChannelName}"
Niche: ${safeNiche}
Topic: ${safePrompt || 'Viral contrarian insight for fast growth'}
Tone: ${channelTone}
Format: ${targetFormat === 'shorts_9_16' ? 'Vertical 9:16 Shorts/Reels' : 'Horizontal 16:9'}
Duration: ${safeDuration} seconds.
Series Mode: ${seriesParts > 1 ? `${seriesParts}-Part Story Arc (${seriesParts} parts with progressive narrative)` : 'Single Episode (5 scenes)'}
Visual Style: ${visualStyle}
${scriptLangInstruction}

CRITICAL AI VIDEO GENERATOR PROMPT FORMAT:
For EVERY scene, generate "aiVideoPrompt" formatted as a 10-second production prompt for video generators like Kling AI / Runway Gen-3 / Luma Dream Machine:
"AI Video Prompt (10 Seconds) ❤️🥹\n\nCreate a beautiful, emotional, ${visualStyle} AI video based on the reference image. [Visual scene & character descriptions]. [Action & lighting details]...\n\nDialogue:\n👧 Girl (emotion): “...”\n👦 Boy (emotion): “...”\n\n[Ending action]... Soft romantic background music, natural facial expressions, smooth animation, warm golden lighting, vertical 9:16 format, high-quality visuals, 10 seconds long. Keep the characters consistent with the reference image. Ensure both dialogues are spoken clearly with accurate lip-sync."`;

          const result = await model.generateContent(prompt);
          const parsed = JSON.parse(result.response.text());

          // Post-process to guarantee every scene has full production AI Video Prompt
          const enrichedScenes = (parsed.scenes || []).map((sc: any, idx: number) => {
            const sceneNum = sc.sceneNumber || idx + 1;
            const partNum = sc.partNumber || (seriesParts > 1 ? Math.floor(idx / 5) + 1 : 1);
            const partTitle = sc.partTitle || `Part ${partNum}`;

            const dialogues: CharacterDialogue[] = Array.isArray(sc.dialogues) && sc.dialogues.length > 0
              ? sc.dialogues
              : [
                  {
                    character: '👧 Girl',
                    emotion: 'shyly, with a sweet smile',
                    text: sc.voiceoverText || 'Agar hum kabhi kisi waja sy dur ho gay, toh kya tum mujhe bhool toh nahi jao ge? 🥹❤️'
                  },
                  {
                    character: '👦 Boy',
                    emotion: 'looking into her eyes lovingly',
                    text: 'Kabhi nahi! Tum meri zindagi ki woh pyari si yaad ho, jise main kabhi khona nahi chahta. 💗✨'
                  }
                ];

            const aiVideoPrompt = (sc.aiVideoPrompt && sc.aiVideoPrompt.includes('AI Video Prompt'))
              ? sc.aiVideoPrompt
              : buildProductionAiVideoPrompt({
                  style: visualStyle,
                  sceneDescription: sc.visualPrompt || 'Cinematic aesthetic scene with characters in warm lighting.',
                  dialogues,
                  aspectRatio: targetFormat === 'shorts_9_16' ? '9:16' : '16:9',
                  durationSeconds: sc.durationSeconds || 10
                });

            return {
              ...sc,
              sceneNumber: sceneNum,
              partNumber: partNum,
              partTitle,
              durationSeconds: sc.durationSeconds || 10,
              dialogues,
              aiVideoPrompt
            };
          });

          let storyParts: StoryPart[] | undefined = undefined;
          if (seriesParts > 1) {
            storyParts = [];
            for (let p = 1; p <= seriesParts; p++) {
              const pScenes = enrichedScenes.filter((s: any) => s.partNumber === p);
              storyParts.push({
                partNumber: p,
                partTitle: pScenes[0]?.partTitle || `Part ${p}`,
                hook: pScenes[0]?.onScreenCaption || `Part ${p} Hook`,
                scenes: pScenes.length > 0 ? pScenes : enrichedScenes.slice((p - 1) * 5, p * 5)
              });
            }
          }

          return NextResponse.json({
            success: true,
            source: 'gemini-ai',
            modelUsed: modelName,
            data: {
              ...parsed,
              seriesParts,
              storyParts,
              scenes: enrichedScenes,
              niche: safeNiche,
              channelName: safeChannelName,
              targetFormat,
              totalDurationSeconds: enrichedScenes.length * 10
            }
          });
        } catch (geminiError: any) {
          console.warn(`Gemini script model ${modelName} fallback:`, geminiError.message);
        }
      }
    }

    // Dynamic Multi-Niche Procedural Generator (Zero-fail guarantee)
    const fallbackData = buildDynamicNicheScript(
      safeNiche, 
      safePrompt, 
      safeChannelName, 
      targetFormat, 
      safeDuration, 
      safeLanguage,
      seriesParts,
      visualStyle
    );

    return NextResponse.json({
      success: true,
      source: 'procedural-ai-engine',
      data: fallbackData
    });

  } catch (error: any) {
    console.error('Automation generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate automation flow' },
      { status: 500 }
    );
  }
}

// Procedural Romantic Anime Multi-Part Story Arc Generator (Bisma Dengue Engine)
function buildRomanticAnimeSeries(
  topicTitle: string,
  targetFormat: 'shorts_9_16' | 'video_16_9',
  duration: number,
  language: 'roman_urdu' | 'english' | 'urdu',
  seriesParts: number = 5,
  visualStyle: string = 'cinematic anime-style'
): VideoAutomationResult {
  const partsData = [
    {
      partNumber: 1,
      partTitle: 'Part 1: The University Floor Promise (Pehli Nazar & Lavender Glow)',
      hook: 'KABHI NAHI BHOOLUNGA 🥹❤️',
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 10,
          visualPrompt: 'A cute little girl wearing lavender clothes sits on the university floor, looking shyly into the eyes of a little boy dressed in black. The boy kneels in front of her and smiles gently. Warm sunlight falls on them through the glass windows. Their eyes sparkle with innocence and affection.',
          voiceoverText: 'Agar hum kabhi kisi waja sy dur ho gay, toh kya tum mujhe bhool toh nahi jao ge?',
          onScreenCaption: 'KABHI NAHI BHOOLUNGA 🥹❤️',
          soundEffect: 'Warm Piano Sparkle & Sunlight Shimmer',
          brollKeyword: 'anime boy and girl golden hour university floor',
          dialogues: [
            { character: '👧 Girl', emotion: 'shyly, with a sweet smile', text: 'Agar hum kabhi Kisi Waja sy dur ho gay , toh kya tum mujhe bhool toh nahi jao ge? 🥹❤️' },
            { character: '👦 Boy', emotion: 'looking into her eyes lovingly', text: 'Kabhi nahi! Tum meri zindagi ki woh pyari si yaad ho, jise main kabhi khona nahi chahta. 💗✨' }
          ],
          actionSummary: 'The girl blushes and smiles, and the boy gently holds her hand. End with both smiling at each other.'
        },
        {
          sceneNumber: 2,
          durationSeconds: 10,
          visualPrompt: 'The boy takes out a delicate lavender silk ribbon and gently ties it around the girl’s wrist. Golden dust particles float in the sunbeams between the high wooden bookshelves of the university library.',
          voiceoverText: 'Ye ribbon hamara pakka wada hai. Jab tak ye tumhare paas hai, faaslay humein juda nahi kar saktay.',
          onScreenCaption: 'HAMARA WADA 🎀✨',
          soundEffect: 'Soft Cello Swell & Heartbeat Thud',
          brollKeyword: 'anime hands tying ribbon golden hour',
          dialogues: [
            { character: '👦 Boy', emotion: 'tying the ribbon with gentle devotion', text: 'Ye ribbon sirf ek kapra nahi hai... ye hamari dosti aur mohabbat ki pehchan hai. 🎀' },
            { character: '👧 Girl', emotion: 'touching the ribbon, eyes shining with tears', text: 'Main isay apni saans ki tarah sambhal ke rakhungi... hamesha ke liye. 🌸🥹' }
          ],
          actionSummary: 'He places his fingers over her wrist, and she blushes warmly looking down with a heartfelt smile.'
        },
        {
          sceneNumber: 3,
          durationSeconds: 10,
          visualPrompt: 'Walking side by side down the grand campus corridor, their shadows stretching on the polished floor. Outside, cherry blossom petals drift past the tall glass windows in the breeze.',
          voiceoverText: 'Har din university ka ye rasta unke hansi mazaak aur be-parwah baaton se goonjta tha.',
          onScreenCaption: 'BE-PARWAH MUSKURAHAT 🌸',
          soundEffect: 'Breeze & Soft Acoustic Strum',
          brollKeyword: 'anime students walking hallway cherry blossom',
          dialogues: [
            { character: '👧 Girl', emotion: 'laughing playfully, turning to him', text: 'Acha suno, kal bhi tum mujhe yahan floor par milo ge na? 🌸' },
            { character: '👦 Boy', emotion: 'chuckle softly, walking closer', text: 'Chahe duniya idhar ki udhar ho jaye, tumhara intezaar hamesha rahega.' }
          ],
          actionSummary: 'They exchange joyful smiles as the camera slowly dollies back through the sunlit archway.'
        },
        {
          sceneNumber: 4,
          durationSeconds: 10,
          visualPrompt: 'Sitting on the rooftop stairs as sunset paints the sky in shades of violet and peach. The boy shares one side of his wired earphones with the girl while they gaze at the horizon.',
          voiceoverText: 'Waqt ka pata hi nahi chala... unki dosti kab zindagi ka sabse ahem hissa ban gayi.',
          onScreenCaption: 'DIL KI DHADKAN 🎧',
          soundEffect: 'Low Lo-Fi Melody & Wind Chime',
          brollKeyword: 'anime rooftop sunset earphones couple',
          dialogues: [
            { character: '👧 Girl', emotion: 'head resting gently near his shoulder', text: 'Ye gana kitna pyara hai na... bilkul hamari kahani jaisa.' },
            { character: '👦 Boy', emotion: 'whispering softly while gazing at the stars', text: 'Kash ye waqt yahin ruk jaye, aur hum hamesha aise hi rahein. 🌌✨' }
          ],
          actionSummary: 'Both look out at the glowing city lights with serene, loving expressions.'
        },
        {
          sceneNumber: 5,
          durationSeconds: 10,
          visualPrompt: 'At the university iron gate under the evening streetlamp. The girl turns back one last time to wave, her lavender scarf fluttering, while he stands watching with a protective, fond gaze.',
          voiceoverText: 'Lekin taqdeer ne unke liye ek aazmaish likh di thi... Jo unki mohabbat ka sabse bada imtehaan tha.',
          onScreenCaption: 'AGLE PART ME DEKHO 💔',
          soundEffect: 'Cinematic Sub-Drop & Bell Tone',
          brollKeyword: 'anime waving goodbye night street lamp',
          dialogues: [
            { character: '👧 Girl', emotion: 'waving with a gentle wistful smile', text: 'Kal subah time par aana, ek zaroori baat karni hai!' },
            { character: '👦 Boy', emotion: 'nodding, raising hand with warm smile', text: 'Pehli ghanti bajne se pehle wahan hounga. Apna khayal rakhna!' }
          ],
          actionSummary: 'Screen softly fades into cinematic blur with notification for Part 2.'
        }
      ]
    },
    {
      partNumber: 2,
      partTitle: 'Part 2: The Rainy Day Confessions (Barish aur Khamoshi)',
      hook: 'FAASLAY DILON KO NAHI TORTE 🌧️💔',
      scenes: [
        {
          sceneNumber: 6,
          durationSeconds: 10,
          visualPrompt: 'Heavy rain pouring over the city bus stop. The girl stands alone drenched in sadness, holding a letter. The boy arrives running with a black umbrella, breathing heavily.',
          voiceoverText: 'Achanak aane wali khabar ne sab kuch badal diya tha.',
          onScreenCaption: 'ACHANAK JUDAI 🌧️',
          soundEffect: 'Thunder Rumble & Rain Ambience',
          brollKeyword: 'anime rain bus stop umbrella running',
          dialogues: [
            { character: '👧 Girl', emotion: 'tears mixing with raindrops on cheeks', text: 'Mere parents shehar chhor kar hamesha ke liye ja rahe hain... aaj aakhri din hai.' },
            { character: '👦 Boy', emotion: 'holding umbrella over her, voice cracking', text: 'Nahi... ye nahi ho sakta! Tum mujhe aise chhor kar nahi ja sakti!' }
          ],
          actionSummary: 'He shields her from the pouring rain, looking desperately into her eyes.'
        },
        {
          sceneNumber: 7,
          durationSeconds: 10,
          visualPrompt: 'Under the umbrella, water droplets dripping from the edges in slow motion. The boy firmly holds both of her shivering hands to give her warmth.',
          voiceoverText: 'Dono ke dilon me dukh tha, lekin mohabbat us se bhi gehri thi.',
          onScreenCaption: 'MAIN INTEZAAR KARUNGA 💔',
          soundEffect: 'Emotional Cello & Rain Drops',
          brollKeyword: 'anime umbrella close up holding hands rain',
          dialogues: [
            { character: '👧 Girl', emotion: 'crying softly, head down', text: 'Faaslay bohot zyada hain... log kehte hain doori sab kuch mita deti hai.' },
            { character: '👦 Boy', emotion: 'lifting her chin gently, eyes burning with resolve', text: 'Log galat kehte hain! Zameen badal sakti hai, mera wada kabhi nahi badal sakta.' }
          ],
          actionSummary: 'He gently wipes a tear from her cheek as her eyes widen with emotional warmth.'
        },
        {
          sceneNumber: 8,
          durationSeconds: 10,
          visualPrompt: 'The departure train slowly approaching the station platform, headlights cutting through the foggy misty evening rain.',
          voiceoverText: 'Train ki aawaz unke judai ke lamhon ka elaan kar rahi thi.',
          onScreenCaption: 'AAKHRI LAMHA 🚂',
          soundEffect: 'Train Horn Echo & Steam Hiss',
          brollKeyword: 'anime train station platform mist rain',
          dialogues: [
            { character: '👧 Girl', emotion: 'stepping onto the train footboard', text: 'Mujhe bhoolna mat... please.' },
            { character: '👦 Boy', emotion: 'standing at the platform edge, voice firm', text: 'Jab tak ye lavender ribbon mere paas hai, har saans tumhari amanat hai.' }
          ],
          actionSummary: 'Train door closes and she presses her hand against the wet glass window.'
        },
        {
          sceneNumber: 9,
          durationSeconds: 10,
          visualPrompt: 'The train accelerates away into the dark rainy horizon. The boy stands motionless in the downpour, staring at the empty tracks.',
          voiceoverText: 'Ek pal me university ka woh roshan aangan veeran ho gaya tha.',
          onScreenCaption: 'KHAMOSH TERA 🖤',
          soundEffect: 'Distant Thunder & Heartbeat Fade',
          brollKeyword: 'anime train moving away dark rain lonely boy',
          dialogues: [
            { character: '👦 Boy', emotion: 'whispering to the empty air', text: 'Chahe saalon lag jayein... main wapis aane tak yahin tumhara intezaar karunga.' }
          ],
          actionSummary: 'Camera pulls up to high angle showing the lone boy standing under the streetlamp.'
        },
        {
          sceneNumber: 10,
          durationSeconds: 10,
          visualPrompt: 'Inside the train, the girl looks down at her wrist where the lavender ribbon is tied, pressing it gently against her heart.',
          voiceoverText: 'Faaslay shuru ho chuke thay, lekin kahani abhi khatam nahi hui thi.',
          onScreenCaption: 'INTEZAAR KI DASTAAN 🎀',
          soundEffect: 'Warm Melancholy Piano Chime',
          brollKeyword: 'anime train interior girl holding ribbon',
          dialogues: [
            { character: '👧 Girl', emotion: 'whispering into the night', text: 'Main wapis aaungi... apna wada nibhane.' }
          ],
          actionSummary: 'Close up on the glowing ribbon with text for Part 3.'
        }
      ]
    },
    {
      partNumber: 3,
      partTitle: 'Part 3: Years of Longing (5 Saal Ka Intezaar)',
      hook: '5 SAAL GUZAR GAYE ⏳',
      scenes: [
        {
          sceneNumber: 11,
          durationSeconds: 10,
          visualPrompt: 'Montage of passing seasons: Autumn leaves falling on the campus floor, followed by winter snow melting into spring blossoms.',
          voiceoverText: 'Panch saal guzar gaye... Mausam badal gaye, log badal gaye, lekin woh university ka floor waisa hi tha.',
          onScreenCaption: '5 SAAL KA SAFAR 🍂',
          soundEffect: 'Wind Sweeping & Clock Ticking',
          brollKeyword: 'anime seasons changing university tree leaves',
          dialogues: [
            { character: '👧 Girl', emotion: 'monologue in foreign university', text: 'Panch saal ho gaye... kya tum aaj bhi wahan aate ho?' },
            { character: '👦 Boy', emotion: 'monologue studying late night', text: 'Har shaam usi floor par baithta hoon, jahan tum pehli bar mili theen.' }
          ],
          actionSummary: 'Split screen of both writing in their journals at midnight.'
        },
        {
          sceneNumber: 12,
          durationSeconds: 10,
          visualPrompt: 'The grown-up boy, now tall and elegant in a tailored black blazer, walking through the same glass hallway of the university.',
          voiceoverText: 'Woh ab ek kamyab shaks ban chuka tha, lekin uski kalai par wahi purana lavender ribbon tha.',
          onScreenCaption: 'RIBBON AAJ BHI HAI 🖤',
          soundEffect: 'Confident Footsteps & Gentle Strings',
          brollKeyword: 'anime handsome boy suit walking university',
          dialogues: [
            { character: '👦 Boy', emotion: 'looking down at the worn-out ribbon on his wrist', text: 'Main ne apna wada nahi toora... aaj bhi tumhara intezaar hai.' }
          ],
          actionSummary: 'He smiles faintly as golden sunlight reflects in his eyes.'
        },
        {
          sceneNumber: 13,
          durationSeconds: 10,
          visualPrompt: 'Airport arrival terminal: Flight from abroad lands. A graceful girl in an elegant lavender trench coat steps through the sliding glass gates.',
          voiceoverText: 'Usi din, barson baad, woh shehar me wapis qadam rakh chuki thi.',
          onScreenCaption: 'SHEHAR ME WAPSI ✈️',
          soundEffect: 'Airport Chime & Rolling Suitcase',
          brollKeyword: 'anime airport arrival girl trench coat lavender',
          dialogues: [
            { character: '👧 Girl', emotion: 'taking a deep breath of familiar air', text: 'Main wapis aa gayi hoon... Apne shehar, apni yaadon ke paas.' }
          ],
          actionSummary: 'She looks at the clock, adjusting her bag with excited anticipation.'
        },
        {
          sceneNumber: 14,
          durationSeconds: 10,
          visualPrompt: 'Taxi driving through the rain-washed city streets past familiar landmarks towards the old university campus.',
          voiceoverText: 'Bina kisi ko bataye, uske qadam seedha usi purani jagah ki taraf mud gaye.',
          onScreenCaption: 'PURANI YAADEIN 🚕',
          soundEffect: 'Car Engine & Rain Wipers',
          brollKeyword: 'anime taxi window rain city view',
          dialogues: [
            { character: '👧 Girl', emotion: 'looking eagerly out the window', text: 'Kya tum aaj bhi wahan hoge? Ya main bohot late ho gayi?' }
          ],
          actionSummary: 'She clutches her purse where the matching ribbon charm hangs.'
        },
        {
          sceneNumber: 15,
          durationSeconds: 10,
          visualPrompt: 'The university gates open wide. She enters the main courtyard under the bright afternoon sun, heart beating fast.',
          voiceoverText: 'Manzil samne thi... aur taqdeer ek bar phir unhe aamne saamne khada karne wali thi.',
          onScreenCaption: 'MANZIL SAMNE HAI ❤️',
          soundEffect: 'Swell of Violin & Rising Heartbeat',
          brollKeyword: 'anime university courtyard entrance girl sunlight',
          dialogues: [
            { character: '👧 Girl', emotion: 'whispering to her beating heart', text: 'Sirf kuch lamhay aur... bus kuch qadam.' }
          ],
          actionSummary: 'She begins running towards the main glass window building.'
        }
      ]
    },
    {
      partNumber: 4,
      partTitle: 'Part 4: The University Floor Promise Kept (Wapis Wahi Jagah)',
      hook: 'KYA WOH WAHAIN HOGA? 🥹',
      scenes: [
        {
          sceneNumber: 16,
          durationSeconds: 10,
          visualPrompt: 'The girl rushes into the glass hallway. Golden sunlight pours through the large panes, exactly like five years ago.',
          voiceoverText: 'Hallway me wahi dhoop thi, wahi khamoshi... aur door floor par ek saya nazar aaya.',
          onScreenCaption: 'DHOOP KI KIRAN ✨',
          soundEffect: 'Fast Footsteps & Echoing Hallway',
          brollKeyword: 'anime hallway running girl golden sunlight',
          dialogues: [
            { character: '👧 Girl', emotion: 'gasping for breath, eyes widening', text: 'Woh... woh wahan khada hai?!' }
          ],
          actionSummary: 'She stops dead in her tracks, clutching her chest in disbelief.'
        },
        {
          sceneNumber: 17,
          durationSeconds: 10,
          visualPrompt: 'Sitting on the university floor near the glass window, the boy in black is looking out at the sky, holding a small lavender sketch book.',
          voiceoverText: 'Woh waqai wahan tha... Har din ki tarah, aaj bhi uske intezaar me baitha hua.',
          onScreenCaption: 'INTEZAAR KHTM HUA 🥹',
          soundEffect: 'Deep Piano Chord & Soft Gasp',
          brollKeyword: 'anime boy sitting university floor looking window',
          dialogues: [
            { character: '👦 Boy', emotion: 'speaking softly to himself while sketching', text: 'Agar tum samne aa jao... toh main sab se pehle tumhara haath thaam loonga.' }
          ],
          actionSummary: 'He traces the silhouette of a girl with lavender clothes on the page.'
        },
        {
          sceneNumber: 18,
          durationSeconds: 10,
          visualPrompt: 'The girl slowly walks towards him, tears freely streaming down her smiling cheeks. Her shadow falls across his sketchbook.',
          voiceoverText: 'Uski aahat sun kar larke ka dil zoor se dhadka.',
          onScreenCaption: 'PEHLI AAHAT 🌸',
          soundEffect: 'Slow Footsteps on Wood & Soft Chime',
          brollKeyword: 'anime girl shadow falling on boy floor',
          dialogues: [
            { character: '👧 Girl', emotion: 'voice trembling with boundless love', text: 'Agar hum kabhi kisi waja sy dur ho gaye... toh kya tum mujhe bhool toh nahi gaye? 🥹❤️' }
          ],
          actionSummary: 'He freezes completely, his hand stopping mid-air over the sketchbook.'
        },
        {
          sceneNumber: 19,
          durationSeconds: 10,
          visualPrompt: 'The boy slowly turns around and looks up. His eyes widen in utter shock, quickly melting into sheer, overwhelming emotional joy.',
          voiceoverText: 'Paanch saal ka intezaar ek lamhe me khushi ke aanso ban kar beh nikla.',
          onScreenCaption: 'TUM WAPIS AA GAYI! 😭❤️',
          soundEffect: 'Triumphant Orchestral Strings & Chime',
          brollKeyword: 'anime boy turning around crying smiling love',
          dialogues: [
            { character: '👦 Boy', emotion: 'standing up instantly, voice full of emotion', text: 'Main ne kaha tha na... Tum meri zindagi ki woh yaad ho jise main marte dam tak nahi kho sakta! 💗✨' }
          ],
          actionSummary: 'He drops the sketchbook and rushes forward, tears in his eyes.'
        },
        {
          sceneNumber: 20,
          durationSeconds: 10,
          visualPrompt: 'Both standing inches apart in the golden sunbeams, staring into each other’s eyes with disbelief and pure affection.',
          voiceoverText: 'Woh pal hamesha ke liye amar ho chuka tha.',
          onScreenCaption: 'DIL KI RAAHAT 🌸',
          soundEffect: 'Soft Romantic Melody',
          brollKeyword: 'anime couple close up staring eyes golden hour',
          dialogues: [
            { character: '👧 Girl', emotion: 'smiling through endless tears', text: 'Tumne sach me intezaar kiya...' },
            { character: '👦 Boy', emotion: 'holding up his wrist with the ribbon', text: 'Har ek din, har ek pal.' }
          ],
          actionSummary: 'Both smile through tears with their hands reaching toward one another.'
        }
      ]
    },
    {
      partNumber: 5,
      partTitle: 'Part 5: Hamesha Ka Saath (The Eternal Embrace & Future)',
      hook: 'HAMESHA KA SAATH ❤️💍',
      scenes: [
        {
          sceneNumber: 21,
          durationSeconds: 10,
          visualPrompt: 'He pulls her into a tight, warm, protective embrace as golden sunbeams wrap around them like a halo. Her face rests gently against his chest.',
          voiceoverText: 'Unki mohabbat ne faaslon ko hara diya tha.',
          onScreenCaption: 'HAMESHA KA SAATH ❤️',
          soundEffect: 'Emotional Cello & Warm Ambient Swell',
          brollKeyword: 'anime tight hug reunion golden light emotional',
          dialogues: [
            { character: '👧 Girl', emotion: 'sobbing tears of relief against his chest', text: 'Ab main tumhe kabhi chhor kar nahi jaungi.' },
            { character: '👦 Boy', emotion: 'holding her tighter, kissing her hair softly', text: 'Ab main tumhe kabhi door jane bhi nahi doonga. 💍' }
          ],
          actionSummary: 'Both hold each other tightly as golden light fills the entire screen.'
        },
        {
          sceneNumber: 22,
          durationSeconds: 10,
          visualPrompt: 'They sit together on the university floor once again, side by side, their hands tightly intertwined with matching ribbons.',
          voiceoverText: 'Wahi floor, wahi dhoop, aur wahi do dil jo hamesha ek doosre ke thay.',
          onScreenCaption: 'WAPIS WAHIN 🌸',
          soundEffect: 'Warm Acoustic Guitar & Soft Chimes',
          brollKeyword: 'anime couple sitting floor holding hands window',
          dialogues: [
            { character: '👧 Girl', emotion: 'leaning head on his shoulder, smiling serenely', text: 'Hamari kahani yahan se shuru hui thi, aur ab hamesha chalegi.' },
            { character: '👦 Boy', emotion: 'smiling softly, squeezing her hand', text: 'Ye sirf shuruat hai... hamara poora jahan baaki hai.' }
          ],
          actionSummary: 'She looks up into his eyes and smiles with absolute peace and security.'
        },
        {
          sceneNumber: 23,
          durationSeconds: 10,
          visualPrompt: 'Camera pulls out of the high glass window into the open blue sky. Birds fly past the blooming campus trees in the sunset breeze.',
          voiceoverText: 'Sachi mohabbat me waqt aur faaslay sirf ek aazmaish hotay hain, anjaam hamesha milan hota hai.',
          onScreenCaption: 'SACHI MOHABBAT 🕊️',
          soundEffect: 'Birds Chirping & Grand Musical Climax',
          brollKeyword: 'anime camera pulling away university building sky',
          dialogues: [
            { character: '👧 Girl', emotion: 'voiceover narration with warmth', text: 'Jo dil me rehte hain, woh kabhi door nahi hotay.' },
            { character: '👦 Boy', emotion: 'voiceover narration with smile', text: 'Aur jo wada nibhana jaante hain, unki mohabbat amar hoti hai.' }
          ],
          actionSummary: 'Golden title card softly appears: "The End • Dil Ka Wada".'
        },
        {
          sceneNumber: 24,
          durationSeconds: 10,
          visualPrompt: 'End card showing cute polaroid photos of their memories together pinned on a corkboard with the lavender ribbon draped over them.',
          voiceoverText: 'Aapko ye 5-Part Love Story kaisi lagi? Comments me zaroor batayein!',
          onScreenCaption: 'COMMENTS ME BATAO 👇',
          soundEffect: 'Camera Shutter Click & Soft Bell',
          brollKeyword: 'anime polaroid photo memory board corkboard',
          dialogues: [
            { character: '👧 Girl', emotion: 'cheerful, sweet tone', text: 'Agar aapko hamari story pasand aayi toh video ko LIKE zaroor karna!' },
            { character: '👦 Boy', emotion: 'warm, friendly smile', text: 'Aur apne khas dost ke sath SHARE karna mat bhoolna! ❤️' }
          ],
          actionSummary: 'Interactive subscribe button pops with glowing heart animation.'
        },
        {
          sceneNumber: 25,
          durationSeconds: 10,
          visualPrompt: 'Pulsing heart animation in lavender and gold with text: "Subscribe for Part-Wise AI Stories • Series Complete ❤️"',
          voiceoverText: 'Agle episode aur nayi story series ke liye abhi channel ko subscribe kar lo!',
          onScreenCaption: 'SUBSCRIBE FOR MORE 🔔',
          soundEffect: 'Double Bell Ding & Sparkle Pop',
          brollKeyword: 'neon heart subscribe button animation anime',
          dialogues: [
            { character: '👦 Boy & 👧 Girl', emotion: 'together in harmony', text: 'Thank you for watching! Stay blessed and keep smiling! ❤️✨' }
          ],
          actionSummary: 'Final screen ends with glowing logo and subscribe reminder.'
        }
      ]
    }
  ];

  // Select 1, 5, or 10 parts
  const selectedParts = seriesParts === 5 
    ? partsData 
    : seriesParts === 10 
    ? [...partsData, ...partsData.map((p, i) => ({ 
        ...p, 
        partNumber: p.partNumber + 5, 
        partTitle: `Part ${p.partNumber + 5}: Chapter ${p.partNumber + 5} (The Journey Continues)` 
      }))] 
    : [partsData[0]];

  // Flatten scenes and build production AI Video Prompts
  const allScenes: SceneItem[] = [];
  selectedParts.forEach(part => {
    part.scenes.forEach(sc => {
      const formattedAiPrompt = buildProductionAiVideoPrompt({
        style: visualStyle,
        sceneDescription: sc.visualPrompt,
        dialogues: sc.dialogues,
        actionSummary: sc.actionSummary,
        aspectRatio: targetFormat === 'shorts_9_16' ? '9:16' : '16:9',
        durationSeconds: 10
      });

      allScenes.push({
        ...sc,
        partNumber: part.partNumber,
        partTitle: part.partTitle,
        aiVideoPrompt: formattedAiPrompt
      });
    });
  });

  return {
    titleOptions: [
      `University Floor Promise: The 10-Second Anime Love Story (Part 1-5 Series) ❤️🥹`,
      `"Agar Hum Dur Ho Gaye Toh?" 5 Saal Baad Wapis Milne Ka Wada 🎀`,
      `The Lavender Ribbon: Purest Emotional Anime Love Story (Full Arc) 🌸`
    ],
    selectedTitle: `University Floor Promise: The 10-Second Anime Love Story (Part 1-5 Series) ❤️🥹`,
    niche: 'romantic_anime',
    channelName: 'Beshaan Animation',
    targetFormat,
    totalDurationSeconds: allScenes.length * 10,
    seriesParts: selectedParts.length,
    storyParts: selectedParts.map(p => ({
      ...p,
      scenes: p.scenes.map(sc => ({
        ...sc,
        partNumber: p.partNumber,
        partTitle: p.partTitle,
        aiVideoPrompt: buildProductionAiVideoPrompt({
          style: visualStyle,
          sceneDescription: sc.visualPrompt,
          dialogues: sc.dialogues,
          actionSummary: sc.actionSummary,
          aspectRatio: targetFormat === 'shorts_9_16' ? '9:16' : '16:9',
          durationSeconds: 10
        })
      }))
    })),
    scenes: allScenes,
    description: `🌸 University Floor Promise: The 10-Second Anime Love Story ❤️🥹\n\nEk pyari si larki lavender kapron me aur ek larka black clothes me university floor par aamne saamne baithay hain. Ek wada jo 5 saal baad bhi nahi toota.\n\nAI Video Prompts included for Kling AI, Runway Gen-3, Luma Dream Machine & Sora!\n\n#Anime #LoveStory #Shorts #Reels #AIAnimation #KlingAI #RunwayGen3 #RomanUrdu #Pakistan`,
    hashtags: ['#Anime', '#LoveStory', '#Shorts', '#Reels', '#AIAnimation', '#KlingAI', '#RunwayGen3', '#RomanUrdu'],
    tags: ['Anime love story', 'AI video prompt', 'kling ai prompt', 'runway gen 3', 'roman urdu anime', 'romantic anime'],
    thumbnailConcept: {
      mainHeadline: 'AGAR HUM DUR HO GAYE?',
      badgeText: 'ROMANTIC ANIME',
      bgColor: '#a855f7'
    }
  };
}

function finalizeAutomationResult(
  result: VideoAutomationResult,
  targetFormat: 'shorts_9_16' | 'video_16_9',
  visualStyle: string = 'cinematic anime-style',
  seriesParts: number = 1
): VideoAutomationResult {
  result.seriesParts = seriesParts;
  result.scenes = (result.scenes || []).map((sc, idx) => {
    const dialogues: CharacterDialogue[] = sc.dialogues || [
      {
        character: '👧 Character A',
        emotion: 'expressively',
        text: sc.voiceoverText || 'Arey dekho zara kya zabardast scene hai!'
      },
      {
        character: '👦 Character B',
        emotion: 'smiling confidently',
        text: 'Agay dekho kya twist ata hai! ⚡'
      }
    ];

    const aiVideoPrompt = sc.aiVideoPrompt || buildProductionAiVideoPrompt({
      style: visualStyle,
      sceneDescription: sc.visualPrompt,
      dialogues,
      aspectRatio: targetFormat === 'shorts_9_16' ? '9:16' : '16:9',
      durationSeconds: sc.durationSeconds || 10
    });

    return {
      ...sc,
      dialogues,
      aiVideoPrompt,
      partNumber: sc.partNumber || 1,
      partTitle: sc.partTitle || 'Part 1'
    };
  });

  return result;
}

// Procedural Multi-Niche Storyline Generator
function buildDynamicNicheScript(
  niche: string,
  customPrompt: string,
  channelName: string,
  targetFormat: 'shorts_9_16' | 'video_16_9',
  duration: number,
  language: 'roman_urdu' | 'english' | 'urdu' = 'roman_urdu',
  seriesParts: number = 1,
  visualStyle: string = 'cinematic anime-style'
): VideoAutomationResult {
  const isCustom = Boolean(customPrompt && customPrompt.trim());
  const topicTitle = isCustom ? customPrompt.trim() : getDefaultTopicForNiche(niche);

  // Check if user requested Romantic Anime / Emotional Story Series
  const isAnimeOrStory = niche === 'romantic_anime' ||
    customPrompt.toLowerCase().includes('anime') ||
    customPrompt.toLowerCase().includes('lavender') ||
    customPrompt.toLowerCase().includes('floor') ||
    customPrompt.toLowerCase().includes('bhool') ||
    customPrompt.toLowerCase().includes('university') ||
    customPrompt.toLowerCase().includes('part') ||
    seriesParts > 1;

  if (isAnimeOrStory && (niche === 'romantic_anime' || customPrompt.toLowerCase().includes('anime') || customPrompt.toLowerCase().includes('lavender') || seriesParts > 1)) {
    return buildRomanticAnimeSeries(topicTitle, targetFormat, duration, language, seriesParts, visualStyle);
  }

  const rawResult = getRawNicheScript(niche, topicTitle, channelName, targetFormat, duration, language, isCustom);
  return finalizeAutomationResult(rawResult, targetFormat, visualStyle, seriesParts);
}

function getRawNicheScript(
  niche: string,
  topicTitle: string,
  channelName: string,
  targetFormat: 'shorts_9_16' | 'video_16_9',
  duration: number,
  language: 'roman_urdu' | 'english' | 'urdu',
  isCustom: boolean
): VideoAutomationResult {

  // =========================================================================
  // 1. BESHAAN (TRIO CREATORS: 2 GIRLS + 1 BOY - FASHION, LIFESTYLE & GAMING)
  // =========================================================================
  if (niche === 'beshaan_trio') {
    if (language === 'roman_urdu') {
      return {
        titleOptions: [
          `Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya! (Two Girls vs One Boy Challenge) 🎀`,
          `Two Girls vs One Boy 1v1 Gaming Battle (Haarne Wale Ko Cake Ka Saza!) 🎮`,
          `Sasti Street Shopping: Luxury Looks Under 5,000 PKR 🛍️`
        ],
        selectedTitle: isCustom ? topicTitle : `Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya! (Two Girls vs One Boy Challenge) 🎀`,
        niche: 'beshaan_trio',
        channelName: 'Beshaan',
        targetFormat,
        totalDurationSeconds: duration,
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 6,
            visualPrompt: 'Vibrant studio setting with 3 young energetic creators (two stylish girls and one boy) laughing together in trendy urban outfits, neon pink and purple rim lights, cinematic 8k',
            voiceoverText: `Arey yaar welcome back to Beshaan! Hum hain teen creators, teen crazy personalities, aur aaj hum karne wale hain: ${topicTitle}!`,
            onScreenCaption: 'WELCOME TO BESHAAN 🎀🎮',
            soundEffect: 'High Energy Whoosh & Pop',
            brollKeyword: 'friends laughing studio group selfie'
          },
          {
            sceneNumber: 2,
            durationSeconds: 7,
            visualPrompt: 'Split screen showing trendy fashion aesthetic wardrobe on the left and glowing RGB gaming setup on the right, high fashion accessories and controller',
            voiceoverText: `Rule number ek: do larkiyan, ek larka, aur zero filter! Isko lagta tha ke ye hamain fashion aur styling me hara dega, lekin twist dekho...`,
            onScreenCaption: 'ZERO FILTER CHALLENGE ⚡',
            soundEffect: 'Record Scratch & Fast Swoosh',
            brollKeyword: 'trendy fashion clothing rack aesthetic'
          },
          {
            sceneNumber: 3,
            durationSeconds: 7,
            visualPrompt: 'Dynamic montage of fast-paced friendly arguing over outfits, laughing, holding up funny styling choices, candid lifestyle banter',
            voiceoverText: `Dekho zara isne poore rules ki aisi tesi kar di! Lekin wait karo, 5000 rupay ke budget me jo final look bana hai na, aap heran reh jaoge!`,
            onScreenCaption: 'ASLI TWIST DEKHO 👗',
            soundEffect: 'Buzzer & Laugh Track Cue',
            brollKeyword: 'outfit try on mirror video'
          },
          {
            sceneNumber: 4,
            durationSeconds: 8,
            visualPrompt: 'Trio standing side by side striking confident high-fashion runway poses, then bursting into genuine laughter with gaming victory poses',
            voiceoverText: `Ye raha hamara final reveal! Abhi comments me ja kar vote karo: round kisne jeeta? Girl one, girl two, ya hamara hero? Jaldi batao!`,
            onScreenCaption: 'VOTE IN COMMENTS 👇',
            soundEffect: 'Sub Bass Impact & Cheer',
            brollKeyword: 'fashion runway model pose group'
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            visualPrompt: 'Sparkling subscribe button with heart icon and notification bell pulsing in neon rose, with text: Stay Stylish. Stay Confident. Keep Gaming.',
            voiceoverText: `Stay stylish, stay confident, keep gaming, aur keep smiling! Jaldi se subscribe button daba do aur Beshaan Family ka hissa bano! ❤️`,
            onScreenCaption: 'JOIN BESHAAN FAMILY ❤️',
            soundEffect: 'Double Bell Ding & Sparkle',
            brollKeyword: 'neon heart subscribe button animation'
          }
        ],
        description: `✨ Welcome to Beshaan (@BeshaanVibe)! Teen Creators | Teen Personalities | Ek Zabardast Safar ❤️\n\n🎀 FASHION & BEAUTY: Trendy outfits, styling hacks, aur affordable fashion ideas.\n🌸 LIFESTYLE: Daily vibes, self-care, aur mazedaar trio challenges.\n🎮 GAMING ZONE: Epic gameplay, funny moments, aur non-stop entertainment!\n\n🔔 Subscribe karo aur Beshaan Family ka hissa bano!\nStay Stylish. Stay Confident. Keep Gaming. Keep Smiling.\nWith Love, Team Beshaan ❤️\n\n#Beshaan #BeshaanVibe #Fashion #Lifestyle #Gaming #TrioGoals #Shorts #Reels #Pakistan`,
        hashtags: ['#Beshaan', '#BeshaanVibe', '#Fashion', '#Lifestyle', '#Gaming', '#TrioGoals', '#Shorts', '#Reels', '#Pakistan', '#StyleHacks'],
        tags: ['Beshaan', 'Beshaan Vibe', 'fashion styling', 'lifestyle challenges', 'gaming funny moments', 'trio creators', 'pakistan creators', 'roman urdu'],
        thumbnailConcept: {
          mainHeadline: 'BOYS VS GIRLS',
          badgeText: 'FASHION & GAMING',
          bgColor: '#ec4899'
        }
      };
    }

    if (language === 'urdu') {
      return {
        titleOptions: [
          `ایک لباس کو 3 مختلف طریقوں سے اسٹائل کیا! 🎀`,
          `دو لڑکیاں بمقابلہ ایک لڑکا: گیمنگ جنگ! 🎮`,
          `سستی اسٹریٹ شاپنگ: 5000 روپے میں بہترین لکس 🛍️`
        ],
        selectedTitle: isCustom ? topicTitle : `ایک لباس کو 3 مختلف طریقوں سے اسٹائل کیا! 🎀`,
        niche: 'beshaan_trio',
        channelName: 'Beshaan',
        targetFormat,
        totalDurationSeconds: duration,
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 6,
            visualPrompt: 'Vibrant studio setting with 3 young energetic creators (two stylish girls and one boy) laughing together in trendy urban outfits, neon pink and purple rim lights, cinematic 8k',
            voiceoverText: `بیشان میں خوش آمدید! ہم تین کریئیٹرز، تین منفرد شخصیات، اور آج کا ہمارا چیلنج ہے: ${topicTitle}!`,
            onScreenCaption: 'ویلکم ٹو بیشان 🎀🎮',
            soundEffect: 'High Energy Whoosh & Pop',
            brollKeyword: 'friends laughing studio group selfie'
          },
          {
            sceneNumber: 2,
            durationSeconds: 7,
            visualPrompt: 'Split screen showing trendy fashion aesthetic wardrobe on the left and glowing RGB gaming setup on the right',
            voiceoverText: `پہلا اصول: دو لڑکیاں، ایک لڑکا، اور کوئی فلٹر نہیں! دیکھیے کون جیتتا ہے...`,
            onScreenCaption: 'زیرو فلٹر چیلنج ⚡',
            soundEffect: 'Record Scratch & Fast Swoosh',
            brollKeyword: 'trendy fashion clothing rack aesthetic'
          },
          {
            sceneNumber: 3,
            durationSeconds: 7,
            visualPrompt: 'Dynamic montage of fast-paced friendly arguing over outfits, laughing, candid lifestyle banter',
            voiceoverText: `دیکھیے اس نے کس طرح قواعد بدلے! لیکن 5000 روپے کے بجٹ میں یہ لک دیکھ کر آپ حیران رہ جائیں گے!`,
            onScreenCaption: 'اصلی ٹوئسٹ دیکھیے 👗',
            soundEffect: 'Buzzer & Laugh Track Cue',
            brollKeyword: 'outfit try on mirror video'
          },
          {
            sceneNumber: 4,
            durationSeconds: 8,
            visualPrompt: 'Trio standing side by side striking confident high-fashion runway poses',
            voiceoverText: `یہ رہا فائنل لک! ابھی کمنٹس میں بتائیے: یہ راؤنڈ کس نے جیتا؟`,
            onScreenCaption: 'کمنٹس میں ووٹ کریں 👇',
            soundEffect: 'Sub Bass Impact & Cheer',
            brollKeyword: 'fashion runway model pose group'
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            visualPrompt: 'Sparkling subscribe button with heart icon and notification bell pulsing in neon rose',
            voiceoverText: `اسٹائلش رہیں، پُراعتماد رہیں، گیمنگ جاری رکھیں، اور مسکراتے رہیں! سبسکرائب ضرور کریں! ❤️`,
            onScreenCaption: 'بیشان فیملی جوائن کریں ❤️',
            soundEffect: 'Double Bell Ding & Sparkle',
            brollKeyword: 'neon heart subscribe button animation'
          }
        ],
        description: `✨ بیشان میں خوش آمدید! تین کریئیٹرز | ایک زبردست سفر ❤️\n\nفیشن، لائف اسٹائل اور گیمنگ!\n\n#Beshaan #BeshaanVibe #Urdu #Pakistan`,
        hashtags: ['#Beshaan', '#BeshaanVibe', '#Fashion', '#Lifestyle', '#Gaming', '#Pakistan'],
        tags: ['Beshaan', 'Beshaan Vibe', 'urdu creators', 'pakistan vlogs'],
        thumbnailConcept: {
          mainHeadline: 'لڑکے بمقابلہ لڑکیاں',
          badgeText: 'فیشن اور گیمنگ',
          bgColor: '#ec4899'
        }
      };
    }

    // Default English
    return {
      titleOptions: [
        `We Styled 1 Outfit 3 Different Ways! (Boys vs Girls Edition) 🎀`,
        `Two Girls vs One Boy 1v1 Gaming Battle (Hilarious Loser Punishment) 🎮`,
        `Affordable Street Shopping: Luxury Looks Under 5,000 PKR 🛍️`
      ],
      selectedTitle: isCustom ? topicTitle : `We Styled 1 Outfit 3 Different Ways! (Boys vs Girls Edition) 🎀`,
      niche: 'beshaan_trio',
      channelName: 'Beshaan',
      targetFormat,
      totalDurationSeconds: duration,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 6,
          visualPrompt: 'Vibrant studio setting with 3 young energetic creators (two stylish girls and one boy) laughing together in trendy urban outfits, neon pink and purple rim lights, cinematic 8k',
          voiceoverText: `Welcome back to Beshaan! We are three creators, three crazy personalities, and today we are tackling ${topicTitle}.`,
          onScreenCaption: 'WELCOME TO BESHAAN 🎀🎮',
          soundEffect: 'High Energy Whoosh & Pop',
          brollKeyword: 'friends laughing studio group selfie'
        },
        {
          sceneNumber: 2,
          durationSeconds: 7,
          visualPrompt: 'Split screen showing trendy fashion aesthetic wardrobe on the left and glowing RGB gaming setup on the right, high fashion accessories and controller',
          voiceoverText: `Rule number one: two girls, one boy, and zero filter. He thinks he can out-style us in fashion, but we challenged him to gaming instead.`,
          onScreenCaption: 'ZERO FILTER CHALLENGE ⚡',
          soundEffect: 'Record Scratch & Fast Swoosh',
          brollKeyword: 'trendy fashion clothing rack aesthetic'
        },
        {
          sceneNumber: 3,
          durationSeconds: 7,
          visualPrompt: 'Dynamic montage of fast-paced friendly arguing over outfits, laughing, holding up funny styling choices, candid lifestyle banter',
          voiceoverText: `Watch how he completely disregarded the rules! But wait until you see the final look she pulled together with under fifty dollars.`,
          onScreenCaption: 'WHO WORE IT BETTER? 👗',
          soundEffect: 'Buzzer & Laugh Track Cue',
          brollKeyword: 'outfit try on mirror video'
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'Trio standing side by side striking confident high-fashion runway poses, then bursting into genuine laughter with gaming victory poses',
          voiceoverText: `Here is the final reveal! Drop a comment right now: who won this round? Girl one, girl two, or the boy? Let us know below!`,
          onScreenCaption: 'VOTE IN COMMENTS 👇',
          soundEffect: 'Sub Bass Impact & Cheer',
          brollKeyword: 'fashion runway model pose group'
        },
        {
          sceneNumber: 5,
          durationSeconds: 7,
          visualPrompt: 'Sparkling subscribe button with heart icon and notification bell pulsing in neon rose, with text: Stay Stylish. Stay Confident. Keep Gaming.',
          voiceoverText: `Stay stylish, stay confident, keep gaming, and keep smiling! Smash that subscribe button and join the Beshaan Family today!`,
          onScreenCaption: 'JOIN BESHAAN FAMILY ❤️',
          soundEffect: 'Double Bell Ding & Sparkle',
          brollKeyword: 'neon heart subscribe button animation'
        }
      ],
      description: `✨ Welcome to Beshaan (@BeshaanVibe)! Three Creators | Three Personalities | One Amazing Journey ❤️\n\n🎀 FASHION & BEAUTY: Trendy outfits, affordable styling & beauty hacks.\n🌸 LIFESTYLE: Daily vibes, self-care & trio challenges.\n🎮 GAMING ZONE: Epic wins, chaotic fails & endless entertainment!\n\n🔔 Subscribe to join the Beshaan Family!\nStay Stylish. Stay Confident. Keep Gaming. Keep Smiling.\n\n#Beshaan #BeshaanVibe #Fashion #Lifestyle #Gaming #TrioGoals #Shorts #Reels #Pakistan`,
      hashtags: ['#Beshaan', '#BeshaanVibe', '#Fashion', '#Lifestyle', '#Gaming', '#TrioGoals', '#Shorts', '#Reels', '#Pakistan', '#StyleHacks'],
      tags: ['Beshaan', 'Beshaan Vibe', 'fashion styling', 'lifestyle challenges', 'gaming funny moments', 'trio creators', 'pakistan creators'],
      thumbnailConcept: {
        mainHeadline: 'BOYS VS GIRLS',
        badgeText: 'FASHION & GAMING',
        bgColor: '#ec4899'
      }
    };
  }

  // =========================================================================
  // 2. WEALTH & BUSINESS (SOLOPRENEUR & MICRO-SAAS)
  // =========================================================================
  if (niche === 'wealth_business') {
    if (language === 'roman_urdu') {
      return {
        titleOptions: [
          `Ghar Bethe $10k/Month Kamanay Ka Secret Web Tool Blueprint 💰`,
          `Bina Employee Ke Micro-SaaS Software Business Kaise Banayein?`,
          `Waqt Bechna Band Karo: Ye 3 Passive Cashflow Assets Banao`
        ],
        selectedTitle: isCustom ? topicTitle : `Ghar Bethe $10k/Month Kamanay Ka Secret Web Tool Blueprint 💰`,
        niche,
        channelName,
        targetFormat,
        totalDurationSeconds: duration,
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 6,
            visualPrompt: 'High quality modern desk setup with minimalist laptop displaying Stripe real-time revenue graph trending upward in green, cinematic lighting',
            voiceoverText: `Ziada tar log sochte hain ke mahine ke dus hazaar dollar kamanay ke liye bari team chahiye. Lekin solo developers single web tools se ghar bethe ye kar rahe hain.`,
            onScreenCaption: 'GHAR BETHE $10K 💰',
            soundEffect: 'Subtle Cash Cha-Ching & Swoosh',
            brollKeyword: 'stripe revenue dashboard laptop'
          },
          {
            sceneNumber: 2,
            durationSeconds: 7,
            visualPrompt: 'Split screen showing complex bloated software on the left vs a clean one-click web utility on the right',
            voiceoverText: `Bari heavy apps banane ke bajaye, sirf ek specific mushkil solve karo, jaise instant automated invoice ya fast document converter.`,
            onScreenCaption: 'EK PROBLEM SOLVE KARO 🎯',
            soundEffect: 'Fast Whoosh',
            brollKeyword: 'clean modern web interface'
          },
          {
            sceneNumber: 3,
            durationSeconds: 7,
            visualPrompt: 'Animated diagram showing organic traffic funneling into recurring micro-subscriptions without ad spend',
            voiceoverText: `Kyunke ye tool lightweight aur fast hai, Google search se daily hazaron log bina kisi paid ad ke aate hain.`,
            onScreenCaption: 'ZERO AD SPEND 📈',
            soundEffect: 'Crisp Pop Sound',
            brollKeyword: 'traffic analytics graph growth'
          },
          {
            sceneNumber: 4,
            durationSeconds: 8,
            visualPrompt: 'Cinematic close-up of coffee cup beside laptop on a sunlit balcony overlooking a city skyline',
            voiceoverText: `Agar 200 businesses aapko sirf 9 dollar monthly subscription dein, toh aapka $1800 ka automated monthly passive cash flow tayyar hai.`,
            onScreenCaption: 'AUTOMATED CASHFLOW 💵',
            soundEffect: 'Success Ding Chime',
            brollKeyword: 'lifestyle freedom laptop terrace'
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            visualPrompt: 'Glowing call-to-action button pulsing in neon amber with bookmark save icon',
            voiceoverText: `Is video ko bookmark kar lo taake baad me kaam aaye, aur daily software blueprints ke liye ${channelName} ko follow karo!`,
            onScreenCaption: 'SAVE AUR FOLLOW KARO 🚀',
            soundEffect: 'Double Bell Notification',
            brollKeyword: 'subscribe button neon animation'
          }
        ],
        description: `💡 Solo developers bina kisi employee ke micro-SaaS machines kaise banate hain.\n\nTakeaways:\n• Single problem par focus\n• Zero ad-spend organic growth\n• High retention monthly subscriptions\n\n🔔 Follow ${channelName} for daily breakdowns!\n\n#shorts #reels #microsaas #entrepreneur #money #business #urdu #pakistan`,
        hashtags: ['#shorts', '#reels', '#microsaas', '#business', '#entrepreneur', '#passiveincome', '#tech', '#urdu'],
        tags: ['micro saas', 'passive income', 'solo founder', 'solopreneur', 'roman urdu business'],
        thumbnailConcept: {
          mainHeadline: 'GHAR BETHE $10K',
          badgeText: 'SOLO SAAS CASH',
          bgColor: '#10b981'
        }
      };
    }
    return {
      titleOptions: [
        `How Solo Creators Make $10k/Month With 1 Web Tool 💰`,
        `The Zero-Employee Micro-SaaS Blueprint (Full Guide)`,
        `Stop Trading Hours For Money: Build These 3 Assets`
      ],
      selectedTitle: isCustom ? topicTitle : `How Solo Creators Make $10k/Month With 1 Web Tool 💰`,
      niche,
      channelName,
      targetFormat,
      totalDurationSeconds: duration,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 6,
          visualPrompt: 'High quality modern desk setup with minimalist laptop displaying Stripe real-time revenue graph trending upward in green, cinematic lighting',
          voiceoverText: `Most people think making ten thousand dollars a month online takes a massive team. But solo developers are doing it alone using single-purpose tools.`,
          onScreenCaption: 'STOP WORKING 9-TO-5 🚨',
          soundEffect: 'Subtle Cash Cha-Ching & Swoosh',
          brollKeyword: 'stripe revenue dashboard laptop'
        },
        {
          sceneNumber: 2,
          durationSeconds: 7,
          visualPrompt: 'Split screen showing complex bloated software on the left vs a clean one-click web utility on the right',
          voiceoverText: `Instead of building complex platforms, they solve one painful problem: like instant invoice generation or automated document conversion.`,
          onScreenCaption: 'SOLVE ONE PROBLEM 🎯',
          soundEffect: 'Fast Whoosh',
          brollKeyword: 'clean modern web interface'
        },
        {
          sceneNumber: 3,
          durationSeconds: 7,
          visualPrompt: 'Animated diagram showing organic traffic funneling into recurring micro-subscriptions without ad spend',
          voiceoverText: `Because the tool is local-first and frictionless, organic search brings hundreds of active users every single day with zero advertising costs.`,
          onScreenCaption: 'ZERO AD SPEND 📈',
          soundEffect: 'Crisp Pop Sound',
          brollKeyword: 'traffic analytics graph growth'
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'Cinematic close-up of coffee cup beside laptop on a sunlit balcony overlooking a city skyline',
          voiceoverText: `Charge nine dollars a month to two hundred businesses, and you have built an automated eighteen-hundred-dollar monthly passive cashflow stream.`,
          onScreenCaption: 'AUTOMATED CASHFLOW 💵',
          soundEffect: 'Success Ding Chime',
          brollKeyword: 'lifestyle freedom laptop terrace'
        },
        {
          sceneNumber: 5,
          durationSeconds: 7,
          visualPrompt: 'Glowing call-to-action button pulsing in neon amber with bookmark save icon',
          voiceoverText: `Bookmark this video before it gets lost in your feed. Follow ${channelName} for daily blueprints on automated software businesses.`,
          onScreenCaption: 'SAVE & FOLLOW 🚀',
          soundEffect: 'Double Bell Notification',
          brollKeyword: 'subscribe button neon animation'
        }
      ],
      description: `💡 Discover how solo developers build zero-employee micro-SaaS cashflow machines.\n\nTakeaways:\n• Single-problem focus\n• Zero ad-spend organic growth\n• High retention subscription models\n\n🔔 Subscribe to ${channelName} for daily business breakdowns!\n\n#shorts #reels #microsaas #entrepreneur #money #business #passiveincome`,
      hashtags: ['#shorts', '#reels', '#microsaas', '#business', '#entrepreneur', '#passiveincome', '#tech', '#viral'],
      tags: ['micro saas', 'passive income', 'solo founder', 'solopreneur', 'software business'],
      thumbnailConcept: {
        mainHeadline: 'SOLO SAAS CASH',
        badgeText: '$10K/MONTH BLUEPRINT',
        bgColor: '#10b981'
      }
    };
  }

  if (niche === 'dark_psychology') {
    if (language === 'roman_urdu') {
      return {
        titleOptions: [
          `3 Body Language Tricks Jo Instant Respect Dilayein 👁️`,
          `10 Seconds Me Jhoot Pakadne Ka FBI Secret Formula`,
          `Khamoshi Ka Formula: Bina Bole Behas Kaise Jeetein?`
        ],
        selectedTitle: isCustom ? topicTitle : `3 Body Language Tricks Jo Instant Respect Dilayein 👁️`,
        niche,
        channelName,
        targetFormat,
        totalDurationSeconds: duration,
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 6,
            visualPrompt: 'Dramatic portrait of a confident charismatic figure in sharp shadows with focused intense gaze, noir cinematic 8k',
            voiceoverText: `High-status log kabhi jaldbaazi me jawab nahi dete. Jab koi mushkil sawal pooche, poore teen second ka pause lo bolne se pehle.`,
            onScreenCaption: '3-SECOND RULE ⏳',
            soundEffect: 'Deep Sub Bass Impact',
            brollKeyword: 'intense gaze confident portrait'
          },
          {
            sceneNumber: 2,
            durationSeconds: 7,
            visualPrompt: 'Close-up of human eyes tracking slight micro-expressions and pupils dilating under studio spotlight',
            voiceoverText: `Dekha unka reaction? Psychology me jo shakhs hadbadi me bolta hai wo defensive lagta hai. Khamoshi aapki taqat show karti hai.`,
            onScreenCaption: 'KHAMOSHI ME TAQAT 🧠',
            soundEffect: 'Heartbeat & Whoosh',
            brollKeyword: 'micro expression eye contact'
          },
          {
            sceneNumber: 3,
            durationSeconds: 7,
            visualPrompt: 'Split-screen showing nervous fidgeting hands vs perfectly steady relaxed palms open on wooden boardroom table',
            voiceoverText: `Doosra rule: apne haath bilkul steady aur saamne rakhein. Ungliyan hilana nervousness dikhata hai, jabke still open palms confidence signal kartay hain.`,
            onScreenCaption: 'STILL HANDS ONLY ✋',
            soundEffect: 'Snapping Finger Cue',
            brollKeyword: 'hands steady boardroom'
          },
          {
            sceneNumber: 4,
            durationSeconds: 8,
            visualPrompt: 'Stylized shadow silhouette standing tall while others glance over in subconscious awe',
            voiceoverText: `Teesra: jumlay ke aakhir me apni awaaz ko halka sa neeche rakhein. Sawaliya andaz behas bulata hai, downward inflection authority deta hai.`,
            onScreenCaption: 'DOWNWARD TONE 🗣️',
            soundEffect: 'Subtle Cinematic Riser',
            brollKeyword: 'authoritative leader walking'
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            visualPrompt: 'Futuristic fingerprint scanner locking with a golden checkmark on glowing dark slate screen',
            voiceoverText: `Is video ko abhi save kar lo agli meeting se pehle dekhne ke liye, aur daily human behavior secrets ke liye ${channelName} ko follow karo!`,
            onScreenCaption: 'SAVE FOR LATER 🔒',
            soundEffect: 'Digital Lock & Chime',
            brollKeyword: 'neon lock security symbol'
          }
        ],
        description: `🧠 Respect aur influence hasil karne ke psychological tactics.\n\nRules:\n• 3-second strategic pause\n• Steady open palms\n• Downward vocal inflection\n\nFollow ${channelName} for daily behavioral insights.\n\n#psychology #mindset #bodylanguage #influence #romanurdu #pakistan #shorts`,
        hashtags: ['#shorts', '#reels', '#psychology', '#bodylanguage', '#influence', '#charisma', '#urdu'],
        tags: ['dark psychology', 'body language', 'charisma tips', 'human behavior', 'roman urdu'],
        thumbnailConcept: {
          mainHeadline: 'KABHI WEAK NA LAGNA',
          badgeText: 'COMMAND RESPECT',
          bgColor: '#7c3aed'
        }
      };
    }
    return {
      titleOptions: [
        `3 Body Language Tricks That Command Instant Respect 👁️`,
        `How to Detect a Lie in 10 Seconds (FBI Technique)`,
        `The Silence Rule: Win Any Argument Without Talking`
      ],
      selectedTitle: isCustom ? topicTitle : `3 Body Language Tricks That Command Instant Respect 👁️`,
      niche,
      channelName,
      targetFormat,
      totalDurationSeconds: duration,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 6,
          visualPrompt: 'Dramatic portrait of a confident charismatic figure in sharp shadows with focused intense gaze, noir cinematic 8k',
          voiceoverText: `High-status communicators never give fast answers. When someone asks you a tough question, pause for three full seconds before speaking.`,
          onScreenCaption: 'THE 3-SECOND PAUSE ⏳',
          soundEffect: 'Deep Sub Bass Impact',
          brollKeyword: 'intense gaze confident portrait'
        },
        {
          sceneNumber: 2,
          durationSeconds: 7,
          visualPrompt: 'Close-up of human eyes tracking slight micro-expressions and pupils dilating under studio spotlight',
          voiceoverText: `Notice how their posture changes? In human psychology, the person who rushes to speak appears defensive. Silence demonstrates unshakeable power.`,
          onScreenCaption: 'SILENCE IS POWER 🧠',
          soundEffect: 'Heartbeat & Whoosh',
          brollKeyword: 'micro expression eye contact'
        },
        {
          sceneNumber: 3,
          durationSeconds: 7,
          visualPrompt: 'Split-screen showing nervous fidgeting hands vs perfectly steady relaxed palms open on wooden boardroom table',
          voiceoverText: `Second: keep your hands still and visible. Fidgeting communicates concealed anxiety, while still open palms signal transparent confidence.`,
          onScreenCaption: 'STILL HANDS ONLY ✋',
          soundEffect: 'Snapping Finger Cue',
          brollKeyword: 'hands steady boardroom'
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'Stylized shadow silhouette standing tall while others glance over in subconscious awe',
          voiceoverText: `Third: lower your vocal pitch slightly at the end of sentences. Asking tones invite debate; downward inflection commands authority.`,
          onScreenCaption: 'DOWNWARD INFLECTION 🗣️',
          soundEffect: 'Subtle Cinematic Riser',
          brollKeyword: 'authoritative leader walking'
        },
        {
          sceneNumber: 5,
          durationSeconds: 7,
          visualPrompt: 'Futuristic fingerprint scanner locking with a golden checkmark on glowing dark slate screen',
          voiceoverText: `Save this breakdown so you can review it before your next high-stakes meeting. Follow ${channelName} for deeper behavioral psychology.`,
          onScreenCaption: 'SAVE FOR LATER 🔒',
          soundEffect: 'Digital Lock & Chime',
          brollKeyword: 'neon lock security symbol'
        }
      ],
      description: `🧠 Psychological tactics to command respect and read between the lines.\n\nKey rules:\n• 3-second strategic pause\n• Open still palms\n• Downward vocal inflection\n\nFollow ${channelName} for daily behavioral insights.\n\n#psychology #mindset #bodylanguage #influence #charisma #shorts #reels`,
      hashtags: ['#shorts', '#reels', '#psychology', '#bodylanguage', '#influence', '#charisma', '#mindset'],
      tags: ['dark psychology', 'body language', 'charisma tips', 'human behavior', 'fbi interrogation'],
      thumbnailConcept: {
        mainHeadline: 'NEVER LOOK WEAK',
        badgeText: 'COMMAND RESPECT',
        bgColor: '#7c3aed'
      }
    };
  }

  if (niche === 'stoicism_mindset') {
    if (language === 'roman_urdu') {
      return {
        titleOptions: [
          `24-Ghante Ka Dopamine Detox Jo Laser Focus Wapis Laye ⚡`,
          `Marcus Aurelius Ke 3 Rules Jab Zindagi Mushkil Ho Jaye`,
          `Motivation Ek Dhoka Hai: Discipline Hamesha Jeetta Hai`
        ],
        selectedTitle: isCustom ? topicTitle : `24-Ghante Ka Dopamine Detox Jo Laser Focus Wapis Laye ⚡`,
        niche,
        channelName,
        targetFormat,
        totalDurationSeconds: duration,
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 6,
            visualPrompt: 'Ancient Roman marble bust of Marcus Aurelius in dramatic golden hour sunlight, weathered stone texture, 8k cinematic',
            voiceoverText: `Agar aap subah uthtay hi har do minute baad apna phone check karte ho, toh bhai aapka dimaagh kharab nahi hai, baseline dopamine hijack ho chuka hai.`,
            onScreenCaption: 'DOPAMINE HIJACK 📱',
            soundEffect: 'Dramatic Bass Swoop',
            brollKeyword: 'scrolling smartphone bed dark'
          },
          {
            sceneNumber: 2,
            durationSeconds: 7,
            visualPrompt: 'Split visual of digital notification storm melting away into serene calm pine forest and mountain river',
            voiceoverText: `Agle 24 ghante ke liye: zero short-form videos, koi processed meethi cheez nahi, aur kaam ke waqt background music band.`,
            onScreenCaption: '24-GHANTE RESET 🛑',
            soundEffect: 'Mute Whoosh Sound',
            brollKeyword: 'calm nature forest meditation'
          },
          {
            sceneNumber: 3,
            durationSeconds: 7,
            visualPrompt: 'Hourglass with golden sand falling slowly in pristine focus, studio rim light',
            voiceoverText: `Pehle teen ghante ajeeb bechaini hogi. Wo bechaini darasal aapke brain ke receptors ka natural sensitivity par wapis aana hai.`,
            onScreenCaption: 'BOREDOM APNAO ⏳',
            soundEffect: 'Clock Ticking Cue',
            brollKeyword: 'hourglass sand time ticking'
          },
          {
            sceneNumber: 4,
            durationSeconds: 8,
            visualPrompt: 'A dedicated individual writing with fountain pen in leather notebook under soft morning lamp',
            voiceoverText: `Baarvein ghante tak, mushkil kitab parhna ya deep coding karna aasan lagne lagega. Boriyat hi genius banati hai.`,
            onScreenCaption: 'GENIUS IN BOREDOM 📖',
            soundEffect: 'Crisp Page Turn & Bell',
            brollKeyword: 'reading writing notebook desk'
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            visualPrompt: 'A glowing stoic emblem with crossed laurels in vibrant amber on black slate',
            voiceoverText: `Is video ko us dost ke sath share karo jisko dopamine reset chahiye, aur daily stoic wisdom ke liye ${channelName} ko follow karo!`,
            onScreenCaption: 'AAJ HI SHURU KARO ⚡',
            soundEffect: 'Triumphant Chime',
            brollKeyword: 'golden laurel triumph symbol'
          }
        ],
        description: `⚡ Apna attention span reset karo aur burnout khatam karo 24 ghante me.\n\nStoic principles:\n• Cheap dopamine band karo\n• Boriyat se mat bhago\n• Unbreakable discipline\n\nFollow ${channelName}!\n\n#stoicism #dopaminedetox #focus #mindset #discipline #romanurdu #pakistan`,
        hashtags: ['#shorts', '#reels', '#stoicism', '#focus', '#discipline', '#productivity', '#urdu'],
        tags: ['dopamine detox', 'stoic philosophy', 'laser focus', 'roman urdu', 'productivity hacks'],
        thumbnailConcept: {
          mainHeadline: 'DIMAAGH RESET KARO',
          badgeText: '24-HOUR DETOX',
          bgColor: '#b45309'
        }
      };
    }
    return {
      titleOptions: [
        `The 24-Hour Dopamine Detox That Restores Focus ⚡`,
        `Marcus Aurelius: 3 Rules For When Life Gets Tough`,
        `Why Motivation Is A Trap (And Discipline Wins Always)`
      ],
      selectedTitle: isCustom ? topicTitle : `The 24-Hour Dopamine Detox That Restores Focus ⚡`,
      niche,
      channelName,
      targetFormat,
      totalDurationSeconds: duration,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 6,
          visualPrompt: 'Ancient Roman marble bust of Marcus Aurelius in dramatic golden hour sunlight, weathered stone texture, 8k cinematic',
          voiceoverText: `If you wake up tired and find yourself opening your phone every two minutes, your brain is not broken. Your baseline dopamine is hijacked.`,
          onScreenCaption: 'YOUR BRAIN IS HIJACKED 📱',
          soundEffect: 'Dramatic Bass Swoop',
          brollKeyword: 'scrolling smartphone bed dark'
        },
        {
          sceneNumber: 2,
          durationSeconds: 7,
          visualPrompt: 'Split visual of digital notification storm melting away into serene calm pine forest and mountain river',
          voiceoverText: `For the next twenty-four hours: no short-form videos, no processed sugar, and zero background music while working.`,
          onScreenCaption: '24-HOUR HARD RESET 🛑',
          soundEffect: 'Mute Whoosh Sound',
          brollKeyword: 'calm nature forest meditation'
        },
        {
          sceneNumber: 3,
          durationSeconds: 7,
          visualPrompt: 'Hourglass with golden sand falling slowly in pristine focus, studio rim light',
          voiceoverText: `The first three hours will feel like torture. That discomfort is your neural receptors recalibrating back to their natural sensitivity.`,
          onScreenCaption: 'EMBRACE THE BOREDOM ⏳',
          soundEffect: 'Clock Ticking Cue',
          brollKeyword: 'hourglass sand time ticking'
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'A dedicated individual writing with fountain pen in leather notebook under soft morning lamp',
          voiceoverText: `By hour twelve, reading a book or tackling a hard coding project will suddenly feel effortless again. Boredom is the birthplace of genius.`,
          onScreenCaption: 'GENIUS IN BOREDOM 📖',
          soundEffect: 'Crisp Page Turn & Bell',
          brollKeyword: 'reading writing notebook desk'
        },
        {
          sceneNumber: 5,
          durationSeconds: 7,
          visualPrompt: 'A glowing stoic emblem with crossed laurels in vibrant amber on black slate',
          voiceoverText: `Share this with someone who needs a reset today. Tap follow for daily stoic wisdom from ${channelName}.`,
          onScreenCaption: 'START TODAY ⚡',
          soundEffect: 'Triumphant Chime',
          brollKeyword: 'golden laurel triumph symbol'
        }
      ],
      description: `⚡ Reset your attention span and conquer mental burnout in 24 hours.\n\nStoic principles:\n• Eliminate cheap dopamine spikes\n• Welcome constructive boredom\n• Build unbreakable self-command\n\nFollow ${channelName} for daily mental clarity!\n\n#stoicism #dopaminedetox #focus #mindset #discipline #marcusaurelius #shorts`,
      hashtags: ['#shorts', '#reels', '#stoicism', '#focus', '#discipline', '#productivity', '#marcusaurelius'],
      tags: ['dopamine detox', 'stoic philosophy', 'laser focus', 'marcus aurelius', 'productivity hacks'],
      thumbnailConcept: {
        mainHeadline: 'RESET YOUR BRAIN',
        badgeText: '24-HOUR DETOX',
        bgColor: '#b45309'
      }
    };
  }

  // Default AI & Tech Storyline (Dynamically enhanced with topicTitle)
  if (language === 'roman_urdu') {
    return {
      titleOptions: [
        `1% Developers AI Se 10x Tezi Se Code Kaise Karte Hain? 🤯`,
        `AI Coding Ka Wo Secret Jo Koi Nahi Bata Raha (Zaroor Dekhein)`,
        `2020 Ki Tarah Code Karna Band Karo: Autonomous Agents Aa Gaye Hain`
      ],
      selectedTitle: isCustom ? topicTitle : `1% Developers AI Se 10x Tezi Se Code Kaise Karte Hain? 🤯`,
      niche: niche || 'ai_tech',
      channelName,
      targetFormat,
      totalDurationSeconds: duration,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 6,
          visualPrompt: `High-speed glowing fiber optic neural network exploding into neon particles, cinematic 8k, related to ${topicTitle}`,
          voiceoverText: `Bhai scrolling band karo! 2026 me 90% developers scratch se coding nahi kar rahe. ${topicTitle} ke peeche asli secret ye hai.`,
          onScreenCaption: 'SCROLLING ROKO ⚠️',
          soundEffect: 'Subtle Bass Drop & Whoosh',
          brollKeyword: 'artificial intelligence technology'
        },
        {
          sceneNumber: 2,
          durationSeconds: 7,
          visualPrompt: 'A futuristic cybernetic holographic dashboard displaying real-time autonomous agent workflows and automated terminal tasks',
          voiceoverText: `Hazaaron lines ka boilerplate likhne ke bajaye, modern engineers autonomous agent pipelines use karke full-stack apps minutes me tayyar karte hain.`,
          onScreenCaption: 'AUTONOMOUS AGENTS 🤖',
          soundEffect: 'Digital Glitch & Typing',
          brollKeyword: 'coding computer screen'
        },
        {
          sceneNumber: 3,
          durationSeconds: 7,
          visualPrompt: 'Split comparison between an exhausted programmer debugging messy legacy code vs an automated terminal executing tasks smoothly',
          voiceoverText: `Puraane developers poora hafta debugging me zaya karte hain. Top 1% engineers local-first AI pipelines se apna output 10x tezi se ship karte hain.`,
          onScreenCaption: '10X SPEED SECRET ⚡',
          soundEffect: 'Fast Swoosh',
          brollKeyword: 'programmer working late'
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'Macro lens view of glowing silicon microchip circuits pulsing with cyan and amber data streams',
          voiceoverText: `Farq sirf ye hai ke wo AI ko sirf basic autocomplete nahi, balkay ek autonomous senior engineering partner samajhte hain.`,
          onScreenCaption: 'AI PARTNERSHIP 🧠',
          soundEffect: 'High Tech Chime',
          brollKeyword: 'computer chip cyber'
        },
        {
          sceneNumber: 5,
          durationSeconds: 7,
          visualPrompt: 'A glowing futuristic subscribe button with a pulsating holographic notification bell in neon amber',
          voiceoverText: `Is video ko abhi save kar lo taake peeche na reh jao, aur daily autonomous AI frameworks ke liye ${channelName} ko follow karo!`,
          onScreenCaption: 'SAVE AUR FOLLOW 🚀',
          soundEffect: 'Crisp Bell Notification',
          brollKeyword: 'neon glowing technology'
        }
      ],
      description: `🚀 Autonomous AI agents aur local-first pipelines software engineering ko fundamentally badal rahe hain.\n\nTopic: ${topicTitle}\n\nTakeaways:\n• Zero-touch automation workflows\n• 10x development velocity\n• Autonomous prompt-to-production pipelines\n\n🔔 Subscribe to ${channelName} for daily breakdowns!\n\n#shorts #reels #ai #coding #developer #softwareengineer #tech #romanurdu #pakistan`,
      hashtags: ['#shorts', '#reels', '#ai', '#developer', '#coding', '#techtrends', '#automation', '#urdu'],
      tags: ['AI automation', 'software engineering 2026', 'autonomous agents', 'coding tips', 'roman urdu'],
      thumbnailConcept: {
        mainHeadline: 'AKELAY CODE NA KARO',
        badgeText: '10X AI VELOCITY',
        bgColor: '#ea580c'
      }
    };
  }

  return {
    titleOptions: [
      `How 1% Developers Build 10x Faster with AI in 2026 🤯`,
      `The AI Coding Secret Nobody Is Telling You (Must Watch)`,
      `Stop Coding Like It's 2020: Autonomous Agents Are Here`
    ],
    selectedTitle: isCustom ? topicTitle : `How 1% Developers Build 10x Faster with AI in 2026 🤯`,
    niche: niche || 'ai_tech',
    channelName,
    targetFormat,
    totalDurationSeconds: duration,
    scenes: [
      {
        sceneNumber: 1,
        durationSeconds: 6,
        visualPrompt: `High-speed glowing fiber optic neural network exploding into neon particles, cinematic 8k, related to ${topicTitle}`,
        voiceoverText: `Stop scrolling. In 2026, 90% of developers aren't coding from scratch anymore. Here is the secret behind ${topicTitle}.`,
        onScreenCaption: 'STOP SCROLLING ⚠️',
        soundEffect: 'Subtle Bass Drop & Whoosh',
        brollKeyword: 'artificial intelligence technology'
      },
      {
        sceneNumber: 2,
        durationSeconds: 7,
        visualPrompt: 'A futuristic cybernetic holographic dashboard displaying real-time autonomous agent workflows and automated terminal tasks',
        voiceoverText: `Instead of writing thousands of lines of boilerplate, modern engineers use autonomous agent pipelines to build full-stack apps in minutes.`,
        onScreenCaption: 'AUTONOMOUS AGENTS 🤖',
        soundEffect: 'Digital Glitch & Typing',
        brollKeyword: 'coding computer screen'
      },
      {
        sceneNumber: 3,
        durationSeconds: 7,
        visualPrompt: 'Split comparison between an exhausted programmer debugging messy legacy code vs an automated terminal executing tasks smoothly',
        voiceoverText: `Traditional developers spend eighty percent of their week debugging. The top one percent use local-first AI pipelines to 10x output.`,
        onScreenCaption: '10X YOUR SPEED ⚡',
        soundEffect: 'Fast Swoosh',
        brollKeyword: 'programmer working late'
      },
      {
        sceneNumber: 4,
        durationSeconds: 8,
        visualPrompt: 'Macro lens view of glowing silicon microchip circuits pulsing with cyan and amber data streams',
        voiceoverText: `The difference? They treat AI as an autonomous engineering partner rather than just an ordinary autocomplete plugin.`,
        onScreenCaption: 'AI PARTNERSHIP 🧠',
        soundEffect: 'High Tech Chime',
        brollKeyword: 'computer chip cyber'
      },
      {
        sceneNumber: 5,
        durationSeconds: 7,
        visualPrompt: 'A glowing futuristic subscribe button with a pulsating holographic notification bell in neon amber',
        voiceoverText: `Save this video right now so you don't fall behind. Follow ${channelName} for daily breakdowns of autonomous AI frameworks.`,
        onScreenCaption: 'SAVE & FOLLOW 🚀',
        soundEffect: 'Crisp Bell Notification',
        brollKeyword: 'neon glowing technology'
      }
    ],
    description: `🚀 Discover how autonomous AI agents and local-first pipelines are fundamentally changing software engineering.\n\nTopic: ${topicTitle}\n\nTakeaways:\n• Zero-touch automation workflows\n• 10x development velocity\n• Autonomous prompt-to-production pipelines\n\n🔔 Subscribe to ${channelName} for daily breakdowns!\n\n#shorts #reels #ai #coding #developer #softwareengineer #tech #viral`,
    hashtags: ['#shorts', '#reels', '#ai', '#developer', '#coding', '#techtrends', '#automation', '#viral'],
    tags: ['AI automation', 'software engineering 2026', 'autonomous agents', 'coding tips', 'youtube shorts', 'instagram reels'],
    thumbnailConcept: {
      mainHeadline: 'DON\'T CODE ALONE',
      badgeText: '10X AI VELOCITY',
      bgColor: '#ea580c'
    }
  };
}

function getDefaultTopicForNiche(niche: string): string {
  switch (niche) {
    case 'romantic_anime':
      return 'University Floor Promise: The 10-Second Anime Love Story ❤️';
    case 'beshaan_trio':
      return 'We Styled 1 Outfit 3 Different Ways! (Boys vs Girls Challenge)';
    case 'wealth_business':
      return 'The Zero-Employee Micro-SaaS Business Model';
    case 'dark_psychology':
      return '3 Body Language Tricks That Command Instant Respect';
    case 'stoicism_mindset':
      return 'The 24-Hour Dopamine Detox That Restores Focus';
    case 'science_space':
      return 'What Actually Happens Near a Black Hole Horizon';
    case 'mystery_facts':
      return 'The Billion-Dollar Typo That Almost Crashed Wall Street';
    default:
      return 'How 1% Developers Build 10x Faster with AI in 2026';
  }
}
