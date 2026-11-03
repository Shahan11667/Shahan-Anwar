import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface SceneItem {
  sceneNumber: number;
  durationSeconds: number;
  visualPrompt: string;
  voiceoverText: string;
  onScreenCaption: string;
  soundEffect: string;
  brollKeyword: string;
}

interface VideoAutomationResult {
  titleOptions: string[];
  selectedTitle: string;
  niche: string;
  channelName?: string;
  targetFormat: 'shorts_9_16' | 'video_16_9';
  totalDurationSeconds: number;
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
  beshaan_trio: [
    { title: 'We Styled 1 Outfit 3 Different Ways! (Two Girls vs One Boy Challenge) 🎀', hook: 'Who wore it best? You will never guess how he styled a girl\'s oversized blazer.', badge: 'FASHION BATTLE' },
    { title: 'Affordable Street Shopping: Luxury Looks Under 5,000 PKR 🛍️', hook: 'Can 3 creators look like a million bucks on a strict street budget? Watch this transformation.', badge: 'BUDGET STYLE' },
    { title: 'Two Girls vs One Boy 1v1 Gaming Battle (Loser Gets Face Cake!) 🎮', hook: 'He promised he could beat both of us blindfolded in this game. Watch karma hit instantly.', badge: 'GAMING CHAOS' },
    { title: 'Who Knows Each Other Best? Trio Best Friend Quiz (Secrets Spilled) 🤫', hook: 'If you fail the question, you have to show your most embarrassing camera roll photo.', badge: 'TRIO SECRETS' },
    { title: 'The 3-Minute Glow Up Challenge Before Recording Our Vlog 🌸', hook: '3 creators, 1 mirror, and exactly 180 seconds to look red-carpet ready. Total chaos ensues.', badge: 'GLOW UP RUSH' },
    { title: 'Playing Horror Games at 3 AM: Why You Never Play With Friends 👻', hook: 'The loudest scream of 2026 happened 12 seconds into this gaming session.', badge: 'HORROR GAMING' },
    { title: 'Boy Tries Doing Our Full Makeup Routine (Hilarious Disaster) 💄', hook: 'He claimed contouring was just drawing lines. Wait until you see the final eyeliner attempt.', badge: 'MAKEUP SWAP' },
    { title: '24 Hours Saying YES to Everything the Other 2 Creators Pick ⚡', hook: 'Rule number one: you cannot say no, no matter what outfit or game they force you into.', badge: '24HR YES' }
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
      niche = 'ai_tech', 
      customPrompt = '', 
      channelName = 'Viral Velocity',
      channelTone = 'High Energy & Hormozi Pop',
      targetFormat = 'shorts_9_16', 
      duration = 35,
      apiKey: userApiKey
    } = body || {};

    // Defensive Sanitization for Worst-Case Inputs
    const safeDuration = (typeof duration === 'number' && !isNaN(duration) && duration >= 10 && duration <= 600) ? Math.round(duration) : 35;
    const safePrompt = typeof customPrompt === 'string' ? customPrompt.slice(0, 5000).trim() : '';
    const safeChannelName = typeof channelName === 'string' && channelName.trim() ? channelName.slice(0, 100) : 'Viral Velocity';
    const safeNiche = typeof niche === 'string' && niche.trim() ? niche : 'ai_tech';
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

            const prompt = `You are a viral YouTube Shorts and Instagram Reels strategist.
Generate ${count} completely unique, high-retention, click-worthy video topics for:
Channel Name: "${channelName}"
Niche: ${niche}
Tone: ${channelTone}
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
                        durationSeconds: { type: SchemaType.NUMBER },
                        visualPrompt: { type: SchemaType.STRING, description: 'Visual prompt for image/video generation' },
                        voiceoverText: { type: SchemaType.STRING, description: 'Spoken narration script' },
                        onScreenCaption: { type: SchemaType.STRING, description: 'Punchy 3-5 word on-screen caption' },
                        soundEffect: { type: SchemaType.STRING, description: 'SFX cue like Whoosh, Boom, Ding' },
                        brollKeyword: { type: SchemaType.STRING, description: 'Stock footage search keyword' }
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

          const prompt = `You are an elite short-form video creator.
Channel: "${safeChannelName}"
Niche: ${safeNiche}
Video Topic: ${safePrompt || 'Viral contrarian insight for fast growth'}
Tone: ${channelTone}
Format: ${targetFormat === 'shorts_9_16' ? 'Vertical 9:16 Shorts/Reels' : 'Horizontal 16:9'}
Duration: ${safeDuration} seconds.
Make exactly 5 scenes with progressive narrative hooks, fast pacing, visual prompts, SFX cues, and Hormozi-style bold pop captions.`;

          const result = await model.generateContent(prompt);
          const parsed = JSON.parse(result.response.text());

          return NextResponse.json({
            success: true,
            source: 'gemini-ai',
            modelUsed: modelName,
            data: {
              ...parsed,
              niche: safeNiche,
              channelName: safeChannelName,
              targetFormat,
              totalDurationSeconds: safeDuration
            }
          });
        } catch (geminiError: any) {
          console.warn(`Gemini script model ${modelName} fallback:`, geminiError.message);
        }
      }
    }

    // Dynamic Multi-Niche Procedural Generator (Zero-fail guarantee)
    const fallbackData = buildDynamicNicheScript(safeNiche, safePrompt, safeChannelName, targetFormat, safeDuration);

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

// Procedural Multi-Niche Storyline Generator
function buildDynamicNicheScript(
  niche: string,
  customPrompt: string,
  channelName: string,
  targetFormat: 'shorts_9_16' | 'video_16_9',
  duration: number
): VideoAutomationResult {
  const isCustom = Boolean(customPrompt && customPrompt.trim());
  const topicTitle = isCustom ? customPrompt.trim() : getDefaultTopicForNiche(niche);

  // Define unique narrative scene structures for different niches
  if (niche === 'beshaan_trio') {
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

  if (niche === 'wealth_business') {
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
