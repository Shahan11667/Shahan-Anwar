/**
 * Beshaan channel rules, shared by the AI Video Studio and the Daily Content Pack.
 * Edit the rules here once; both places use them.
 */

export const BESHAAN = 'Beshaan (Fashion • Lifestyle • Gaming)';

export const BESHAAN_CONTEXT =
  'CHANNEL: BESHAAN. Three young Pakistani creators (two girls, one boy) act out short, real-life stories. Tone: warm, natural, funny where it fits, family-safe. The three recurring characters always look the same.';

export const isBeshaan = (genre: string) => genre.toLowerCase().startsWith('beshaan');

/** Second channel: heartfelt Urdu stories about love, respect, patience, gratitude and good manners. */
export const HEART = 'Heartfelt Stories (Mohabbat • Izzat • Sabr • Shukr)';
export const isHeart = (genre: string) => genre.toLowerCase().startsWith('heartfelt');
export const HEART_FOCUS = [
  'Emotional Stories',
  'Family Relationship Stories',
  'University Friendship & Love Stories',
  'Maa-Baap Ki Mohabbat',
  'Husband-Wife Ka Pyara Rishta',
  'Islamic Moral Stories',
  'Zindagi Badalne Wale Sabak',
  'Dosti, Bharosa Aur Insaniyat Ki Kahaniyan',
] as const;

/** Hashtags for the Beshaan Family channel (from the channel description), used in every SEO. */
export const HEART_HASHTAGS = '#BeshaanFamily #EmotionalStories #FamilyStories #MoralStories #UrduStories #UrduKahaniyan #HeartTouchingStories #LifeLessons';

/** One topic per video, so the channel feels like ONE kind of content (no fashion + gaming + action mix). */
export const FOCUS = ['Life lessons', 'Fashion', 'Lifestyle', 'Gaming'] as const;

export const FOCUS_HINT: Record<string, string> = {
  'Life lessons': 'everyday life: family, friends, college, work, money, social media',
  Fashion: 'clothes, style, shopping, looks and confidence',
  Lifestyle: 'daily routines, home life, habits, food, health, money',
  Gaming: 'gaming life: playing with friends, online games, studies vs games, family',
  'Emotional Stories': 'touching everyday stories that make the viewer feel something: regret, reunion, kindness, missing someone',
  'Family Relationship Stories': 'bonds inside a family: siblings, cousins, in-laws, grandparents, misunderstandings and making peace',
  'University Friendship & Love Stories': 'life at university: friendships, study pressure, a respectful and honest bond between two classmates, trust, jealousy and growing up (clean and modest, no dating scenes)',
  'Maa-Baap Ki Mohabbat': 'the silent love and sacrifices of mothers and fathers, and children who realise it',
  'Husband-Wife Ka Pyara Rishta': 'a respectful married couple: small everyday care, patience, apologies and gratitude',
  'Islamic Moral Stories': 'everyday situations that show Islamic values like honesty, sabr, shukr, forgiveness, charity and respect for parents and neighbours',
  'Zindagi Badalne Wale Sabak': 'life lessons that change a person: failure and trying again, time, good company, habits, humility',
  'Dosti, Bharosa Aur Insaniyat Ki Kahaniyan': 'friendship, trust and humanity: a loyal friend, keeping someone\'s trust, helping a stranger or a neighbour, standing by a friend in a hard time',
};

export const FOCUS_THEMES: Record<string, string[]> = {
  'Life lessons': [
    'comparing your life with others on social media', 'peer pressure at college', 'lying to parents and getting caught', 'sibling jealousy',
    'a friend who only calls when they need something', 'exam stress and the temptation to cheat', 'spending pocket money to show off',
    'judging someone by their looks', 'ignoring parents while on the phone', 'helping a stranger who cannot pay you back', 'breaking a promise to a friend',
    'trusting someone you only know online', 'putting things off until the last minute', 'gossip that hurts someone', 'being the first to say sorry',
    'being thankful for what you have', 'fake friends vs real friends', 'first job interview nerves', 'hiding a mistake instead of owning it',
    'making fun of the quiet classmate', 'a parent working hard without saying it', 'borrowing money and not returning it',
  ],
  Fashion: [
    'expensive brand vs a simple outfit (what really matters)', 'copying a trend that does not suit you', 'people commenting on your body at a wedding',
    'feeling ashamed to wear thrifted clothes', "borrowing a friend's dress and damaging it", 'dressing for Instagram vs dressing for yourself',
    'last-minute Eid outfit stress', 'confidence in modest fashion', 'overspending on clothes you wear once', "laughing at someone's simple clothes",
    "mom's old outfit becomes the best look", 'a fake designer bag gets exposed', 'getting ready late because of too many outfit changes',
  ],
  Lifestyle: [
    'phones at the family dinner table', 'saving money vs spending it', 'junk food vs home food', 'never helping mom with chores',
    'a morning routine that changes your day', 'staying up all night and paying for it', 'a messy room and a surprise guest', 'small acts of kindness at home',
    'taking parents for granted', 'living on a small budget for a week', 'online shopping addiction', 'making time for grandparents',
  ],
  Gaming: [
    'gaming the night before an exam', 'a toxic teammate online', 'learning to lose gracefully', 'spending real money on game skins',
    'parents who do not understand gaming', 'a scam inside an online game', 'a gaming friend from another city', 'gaming vs family time',
    'cheating in a game and getting banned', 'rage quitting and breaking things', 'a younger sibling who wants to play too', 'sharing your account password',
  ],
  'Emotional Stories': [
    'a child who finally understands what his mother gave up for him', 'a forgotten birthday and the small surprise that fixes it',
    'an old friend who appears again after years', 'an apology that comes too late', 'a student who lost hope and a teacher who did not give up on him',
    'a lonely neighbour and a plate of food', 'a first salary spent on the family', 'a letter found in an old drawer',
    'a shy girl who is finally heard', 'a brother who protects his sister without saying a word', 'a lost wallet returned with honesty',
    'missing someone who moved abroad', 'a kind word to a stranger who needed it',
  ],
  'Family Relationship Stories': [
    'two siblings who stopped talking over a small fight', 'a daughter-in-law and a mother-in-law learning to understand each other',
    'the eldest son silently carrying the family burden', 'cousins comparing themselves at a family gathering', 'a sister who gives up her wish so her brother can study',
    'grandparents who feel ignored in their own home', 'a family dinner where everyone is on their phones', 'a misunderstanding between two brothers over money',
    'a younger sibling copying what the elders do', 'making peace the night before a family function', 'the relative everyone avoids and what they are really going through',
    'parents arguing in front of the kids and the child\'s quiet question',
  ],
  'University Friendship & Love Stories': [
    'a friend who helps before the exam without being asked', 'two classmates who study together and learn to respect each other', 'jealousy between best friends over marks',
    'a boy who admires a classmate and chooses to respect her and focus on studies first', 'a group project where one friend does all the work', 'a friend who lies to hide a bad result',
    'a scholarship student who feels out of place and a friend who makes him feel at home', 'an honest apology after hurting a friend with a joke', 'choosing a true friend over the popular group',
    'a girl who wants to tell her parents the truth about her results', 'a friendship that fades when one gets busy, and the call that fixes it', 'the last day at university and what the friends say to each other',
    'a love that waits for a degree and a family\'s blessing',
  ],
  'Maa-Baap Ki Mohabbat': [
    'a mother who stays awake the night before her child\'s exam', 'a father who walks to work to save money for his child\'s shoes', 'a mother who says she has already eaten',
    'a father\'s silence and the love behind it', 'a child who shouts at his parents and regrets it', 'the parents\' old phone and the child\'s new one',
    'a mother\'s dua before every journey', 'a father who never says I love you but shows it', 'a mother\'s hands, rough from years of work',
    'taking the parents out for the first time', 'a daughter\'s wedding and a father\'s hidden tears', 'a parent waiting at the door for a late-night child',
  ],
  'Husband-Wife Ka Pyara Rishta': [
    'a husband who notices the small things his wife does', 'a wife who stays patient when money is tight', 'a small argument that ends with chai and an apology',
    'a husband helping in the kitchen for the first time', 'a wife\'s tiring day and a quiet surprise from her husband', 'saying thank you after years of marriage',
    'a misunderstanding about a late-night phone call', 'a couple learning to listen instead of trying to win', 'caring for a sick husband or wife',
    'a forgotten anniversary and the simple way to fix it', 'a wife who supports her husband\'s dream', 'a husband who says sorry first',
  ],
  'Islamic Moral Stories': [
    'telling the truth even when it costs you', 'sabr (patience) while waiting for a result', 'shukr (gratitude) after losing something',
    'forgiving someone who wronged you', 'giving sadaqah quietly without showing off', 'respect for neighbours and their rights',
    'returning something that is not yours', 'not talking behind a friend\'s back', 'keeping a promise (amanat)',
    'a shopkeeper who does not cheat his customers', 'helping a poor person with dignity', 'being kind to parents in their old age', 'making dua instead of complaining',
  ],
  'Zindagi Badalne Wale Sabak': [
    'failing once and trying again', 'a small habit that changes a life in a year', 'valuing time before it runs out',
    'choosing a good friend over a popular one', 'saying no to a bad habit', 'learning from a mistake instead of hiding it',
    'a small kindness that comes back years later', 'working honestly even when nobody is watching', 'being thankful instead of comparing',
    'listening to the advice of elders', 'the cost of anger and the power of silence', 'starting small instead of waiting for the perfect time',
  ],
  'Dosti, Bharosa Aur Insaniyat Ki Kahaniyan': [
    'a friend who stays beside you when everyone else leaves', 'keeping a friend\'s secret even when it is hard', 'a misunderstanding between two friends and the one who calls first',
    'sharing your lunch with a classmate who has none', 'a friend who lends money quietly and never mentions it', 'helping an old neighbour carry her shopping',
    'a friend who tells you the truth, not what you want to hear', 'a new student who has no one to sit with', 'standing up for a friend who is being laughed at',
    'a stranger who helps in the rain and asks nothing', 'a trust that is broken and slowly earned back', 'a shopkeeper who gives credit to a family in need',
    'two old friends meeting after many years',
  ],
};

/** Themes for the other niches (no Beshaan topics). */
export const ANGLES = [
  'shopping haul', 'camping night', 'cafe date gone wrong', 'talent show', 'DIY craft', 'dance-off', 'detective hunt', 'makeup vs no-makeup', 'street food tour', 'school reunion', 'time-capsule', 'lip-sync battle', 'escape room', 'blind taste test', 'sleepover dares', 'surprise makeover', 'harmless prank', 'budget vs expensive', 'gaming tournament',
  'room / wardrobe tour', 'road trip', 'cooking disaster', 'birthday surprise', 'swap roles for a day', 'mystery to solve',
  'college life', 'rainy day', 'fashion show at home', 'thrift flip', '24-hour challenge', 'recreate a viral trend',
  'rivalry between friends', 'learning a new skill', 'secret revealed', 'lost-and-found adventure',
];

/** Every story: relatable, realistic, one clear lesson (applies to all niches). */
export const STORY_RULES =
  'STORY RULES: Tell ONE relatable story that real viewers (teens to adults, 13+) can see themselves in: something that really happens in everyday life. Structure: a hook in the first 3 seconds, a real everyday problem, a mistake or conflict, a turning point, and a clear LESSON at the end, said naturally by a character (not preachy). Even a challenge or prank must have this lesson. No crime or anything illegal (theft, violence, drugs): the mistake is an ordinary everyday one like lying, showing off, ignoring someone or breaking a promise. No content made for small children, no cartoonish nonsense.';

export const beshaanRules = (focus: string) =>
  `TOPIC FOR THIS VIDEO: ${focus} (${FOCUS_HINT[focus] || focus}). Stay on this ONE topic only: do NOT mix fashion, lifestyle and gaming in the same video. Realistic everyday Pakistani settings (home, college, family, friends, market, office, social media). NO horror, ghosts, fantasy, superpowers, fights, villains, explosions or action-movie scenes.`;

export const HEART_CONTEXT =
  'CHANNEL: BESHAAN FAMILY, heartfelt Urdu story videos. Our aim: every story carries a message of love (mohabbat), respect (izzat), patience (sabr), gratitude (shukr) and good manners (ikhlaq). Tone: warm, emotional, respectful, modest and family-safe. Ordinary people in ordinary Pakistani homes and streets (a family, a couple, parents and children, friends, neighbours; friends in a story are of the same gender, with no romance): two or three main characters who look the same in every scene. Family members call each other the way Pakistani families do (Ammi, Abbu, Bhai, Baji, Dadi, Nani, beta); never use "Baap" or "Maa" as a name or a way of address.';

/**
 * The story shape for a video of n scenes. A 3-part or 4-part video is told as Hook, Problem, Solution, Result
 * (each part is one prompt, and the parts must connect like one film: same place, same people, same outfits).
 */
export const arcFor = (n: number) =>
  n === 3
    ? 'ONE story told in exactly 3 connected parts: beat 1 = HOOK + PROBLEM (something catches the viewer in the first seconds, then the real everyday problem), beat 2 = SOLUTION (the turning point: someone does the right thing), beat 3 = RESULT + LESSON (how it ends, and a character says the lesson).'
    : n === 4
      ? 'ONE story told in exactly 4 connected parts: beat 1 = HOOK (something catches the viewer in the first seconds), beat 2 = PROBLEM (the real everyday problem or mistake), beat 3 = SOLUTION (the turning point: someone does the right thing), beat 4 = RESULT + LESSON (how it ends, and a character says the lesson).'
      : `ONE story with a clear arc over exactly ${n} beats: beat 1 is the hook (something interesting happens in the first seconds), then the everyday situation, the mistake or conflict, it gets worse, the turning point, the resolution, and the LAST beat shows the lesson.`;

export const heartRules = (focus: string) =>
  `TOPIC FOR THIS VIDEO: ${focus} (${FOCUS_HINT[focus] || focus}). Stay on this ONE topic. The story is based on a REAL-LIFE situation that people of every age recognise from their own life, and every viewer (young or old) must take something useful away from it. Realistic everyday Pakistani homes and streets. Show the lesson through what happens, never through a lecture. Always modest and family-safe: no romance beyond a respectful married couple, no violence, no horror, no fantasy. NEVER show, name or voice prophets, sahaba, angels or other holy figures, and NEVER quote a Quran verse or a hadith: show the value through the story. Characters may use everyday phrases like Assalamualaikum, Alhamdulillah, InshaAllah, JazakAllah.`;

/** The topics of a channel (empty for genres without topics). */
export const focusesOf = (genre: string): readonly string[] => (isBeshaan(genre) ? FOCUS : isHeart(genre) ? HEART_FOCUS : []);

/** A topic that really belongs to the genre (a leftover topic of another channel becomes the channel's first topic). */
export const focusFor = (genre: string, focus: string) => {
  const list = focusesOf(genre);
  return list.length && !list.includes(focus) ? list[0] : focus;
};

/** The rules every prompt gets: channel + topic (Beshaan / Heartfelt) + story rules. */
export const storyContext = (genre: string, focus: string) => {
  const f = focusFor(genre, focus);
  const head = isBeshaan(genre) ? `${BESHAAN_CONTEXT} ${beshaanRules(f)} ` : isHeart(genre) ? `${HEART_CONTEXT} ${heartRules(f)} ` : '';
  return `${head}${STORY_RULES} `;
};

/** How the spoken lines must be written (the AI's Roman Urdu is weak unless it is told what natural means). */
export const DIALOGUE_RULES =
  'Dialogue rules: short natural sentences like real people speak at home, correct grammar, every line understandable on its own; every character speaks with the grammar of their own gender (a man says "karunga", a woman says "karungi") and the same character is never given two genders; people call each other by name or by relation (Ammi, Abbu, Bhai, Baji, beta), and a relation word is only used for that relation (Ammi and Abbu are said by children to their parents, never between a husband and a wife, and nobody is called by their own name); no line is repeated; no proverbs or lectures; no on-screen text, titles or captions.';

export const LANG_LABEL: Record<'roman_urdu' | 'english' | 'urdu', string> = {
  roman_urdu: 'Roman Urdu (Urdu written in English letters)',
  english: 'English',
  urdu: 'Urdu (Arabic script)',
};
