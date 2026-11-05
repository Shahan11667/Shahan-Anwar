/**
 * Beshaan channel rules, shared by the AI Video Studio and the Daily Content Pack.
 * Edit the rules here once; both places use them.
 */

export const BESHAAN = 'Beshaan (Fashion • Lifestyle • Gaming)';

export const BESHAAN_CONTEXT =
  'CHANNEL: BESHAAN. Three young Pakistani creators (two girls, one boy) act out short, real-life stories. Tone: warm, natural, funny where it fits, family-safe. The three recurring characters always look the same.';

export const isBeshaan = (genre: string) => genre.toLowerCase().startsWith('beshaan');

/** One topic per video, so the channel feels like ONE kind of content (no fashion + gaming + action mix). */
export const FOCUS = ['Life lessons', 'Fashion', 'Lifestyle', 'Gaming'] as const;

export const FOCUS_HINT: Record<string, string> = {
  'Life lessons': 'everyday life: family, friends, college, work, money, social media',
  Fashion: 'clothes, style, shopping, looks and confidence',
  Lifestyle: 'daily routines, home life, habits, food, health, money',
  Gaming: 'gaming life: playing with friends, online games, studies vs games, family',
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

/** The rules every prompt gets: channel + topic (Beshaan only) + story rules. */
export const storyContext = (genre: string, focus: string) =>
  `${isBeshaan(genre) ? `${BESHAAN_CONTEXT} ${beshaanRules(focus)} ` : ''}${STORY_RULES} `;

export const LANG_LABEL: Record<'roman_urdu' | 'english' | 'urdu', string> = {
  roman_urdu: 'Roman Urdu (Urdu written in English letters)',
  english: 'English',
  urdu: 'Urdu (Arabic script)',
};
