import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import {
  getCharacterSnsProfile,
  getAllSnsCharacterIds,
  type CharacterSnsProfile,
} from '../config/characterSnsProfiles';

// ===== Lifestyle Feed Service =====
// Inspired by 恋与深空's 朋友圈 system

const CHARACTER_FEED_CONTEXTS: Record<
  string,
  {
    locations: string[];
    activities: string[];
    currentEvents: string[];
    languageChallenges: string[];
  }
> = {
  akari: {
    locations: [
      'Shimokitazawa',
      'Harajuku',
      'Yoyogi Park',
      'Nakameguro canal',
      'Shinjuku Gyoen',
      'Café Zenon counter',
      'Sophia University library',
    ],
    activities: [
      'studying at café',
      'cycling to campus',
      'working shift at café',
      'collecting vintage items at market',
      'taking photos in rain',
      'writing in journal',
      'feeding the window cat',
    ],
    currentEvents: [
      'cherry blossom season',
      'rainy season',
      'autumn leaves',
      'winter illuminations',
      'hanami picnic',
      'tanabata festival',
    ],
    languageChallenges: [
      'seasonal expressions',
      'café vocabulary',
      'feelings in Japanese',
      'onomatopoeia quiz',
      'keigo vs casual',
    ],
  },
  mina: {
    locations: [
      'Hongdae',
      'Han River cycling path',
      'Bukchon Hanok Village',
      'Gwangjang Market',
      'Gangnam office district',
      'her tiny goshiwon room',
    ],
    activities: [
      'working on ad design',
      'cycling along Hangang',
      'eating late-night ramyeon',
      'sketching at a café',
      'playing with Eomuk',
      'browsing vintage stores',
    ],
    currentEvents: [
      'cherry blossom lanterns',
      'monsoon season',
      'Chuseok holiday',
      'Seoul Design Week',
      'winter snow on Hangang',
    ],
    languageChallenges: [
      'aegyo expressions',
      'office Korean',
      'food ordering phrases',
      'honorific levels',
      'Seoul slang',
    ],
  },
  sophie: {
    locations: [
      'Montmartre hilltop',
      'her attic studio',
      'the neighborhood boulangerie',
      'Sacré-Cœur steps',
      'Musée d\'Orsay',
      'Seine riverbanks',
    ],
    activities: [
      'painting in her studio',
      'buying morning croissant',
      'sketching at Sacré-Cœur',
      'walking along the Seine',
      'browsing art supplies',
      'having espresso at a terrasse',
    ],
    currentEvents: [
      'Paris spring blooms',
      'Fête de la Musique',
      'autumn in the jardins',
      'Nuit Blanche art night',
      'Christmas markets',
    ],
    languageChallenges: [
      'art vocabulary in French',
      'ordering at boulangerie',
      'French expressions of love',
      'faux amis (false friends)',
      'French food culture words',
    ],
  },
  carlos: {
    locations: [
      'Ipanema Beach',
      'his beachside shack',
      'Sugarloaf lookout',
      'Lapa neighborhood',
      'Copacabana boardwalk',
      'Tijuca Forest trail',
    ],
    activities: [
      'surfing at dawn',
      'teaching a surf lesson',
      'photographing street scenes',
      'eating açaí at the beach',
      'playing guitar in his hammock',
      'exploring local markets',
    ],
    currentEvents: [
      'Carnival prep',
      'winter surf season',
      'Brazilian spring',
      'New Year at Copacabana',
      'Festa Junina',
    ],
    languageChallenges: [
      'surf lingo in Portuguese',
      'Brazilian vs European Portuguese',
      'expressions with saudade',
      'food words at the market',
      'music vocabulary',
    ],
  },
};

/**
 * Generate a single rich feed post for a character using their SNS profile.
 */
export async function generateFeedPost(
  characterId: string,
  postType: string
): Promise<any> {
  const snsProfile = getCharacterSnsProfile(characterId);
  const ctx = CHARACTER_FEED_CONTEXTS[characterId];
  if (!ctx) throw new Error(`Unknown character: ${characterId}`);

  // Pick random context elements
  const location = ctx.locations[Math.floor(Math.random() * ctx.locations.length)];
  const activity = ctx.activities[Math.floor(Math.random() * ctx.activities.length)];
  const pillar = snsProfile
    ? snsProfile.contentPillars[Math.floor(Math.random() * snsProfile.contentPillars.length)]
    : activity;
  const photoStyle = snsProfile
    ? snsProfile.photoStyles[Math.floor(Math.random() * snsProfile.photoStyles.length)]
    : `${location}, soft natural light, candid photography`;
  const nativePhrase = snsProfile
    ? snsProfile.nativePhrases[Math.floor(Math.random() * snsProfile.nativePhrases.length)]
    : null;

  // Pick a time-appropriate routine item
  const now = new Date();
  const routineItem = snsProfile
    ? pickRoutineByTime(snsProfile, now)
    : null;

  // Build the rich prompt using SNS profile
  const systemPrompt = snsProfile?.feedSystemPrompt || '';
  const snsRef = snsProfile
    ? `\nSNS STYLE REFERENCE: Mimic the aesthetic and posting style of: ${snsProfile.snsAccounts.map(a => `${a.handle} (${a.description})`).join('; ')}\nAESTHETIC: ${snsProfile.aesthetic}\nCAPTION VOICE: ${snsProfile.captionVoice}`
    : '';

  const result = await completeHaiku(
    `${systemPrompt}
${snsRef}

Generate a social media post. Context: ${activity} at ${location}.
Content theme: ${pillar}
Post type: ${postType}
${routineItem ? `Current time context: ${routineItem.time} — ${routineItem.activity} at ${routineItem.location}` : ''}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "caption": "Post caption in character voice (1-3 sentences, mix English + native language naturally, include 2-3 emojis, optionally 1-2 hashtags at end)",
  "nativePhrase": "A key native-language phrase from the caption",
  "nativeReading": "Romanized pronunciation of the native phrase (null if Latin script language)",
  "translation": "Natural English translation of the native phrase",
  "imageDescription": "Rich, specific description of the photo: ${photoStyle}",
  "mood": "One word: cozy | dreamy | energetic | reflective | playful | warm | moody | golden",
  "locationTag": "Specific real location name",
  "timeOfDay": "morning | afternoon | evening | night | dawn | dusk",
  "engagementHook": "A question or prompt to get the viewer to reply (null for 50% of posts)",
  "culturalNote": "Brief cultural context that makes this a language-learning moment (1-2 sentences)",
  "languageTip": { "word": "a word from the post", "pronunciation": "how to say it", "meaning": "what it means", "usage": "when to use it" }
}`,
    600
  );

  try {
    // Try to extract JSON from possible markdown wrapping
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);

    // Enrich with SNS metadata
    if (snsProfile) {
      parsed.characterHandle = snsProfile.handle;
      parsed.characterDisplayName = snsProfile.displayName;
      parsed.snsInspiredBy = snsProfile.snsAccounts.map(a => a.handle);
    }

    return parsed;
  } catch {
    return {
      caption: `Just a moment at ${location}...`,
      nativePhrase: nativePhrase?.phrase || '',
      nativeReading: nativePhrase?.reading || null,
      translation: nativePhrase?.meaning || '',
      imageDescription: photoStyle,
      mood: 'reflective',
      locationTag: location,
      timeOfDay: 'afternoon',
      engagementHook: null,
      culturalNote: `A real place in ${characterId}'s city.`,
      languageTip: null,
      characterHandle: snsProfile?.handle || null,
      characterDisplayName: snsProfile?.displayName || null,
      snsInspiredBy: snsProfile?.snsAccounts.map(a => a.handle) || [],
    };
  }
}

/**
 * Pick the most time-appropriate routine item for a character.
 */
function pickRoutineByTime(profile: CharacterSnsProfile, now: Date): { time: string; activity: string; location: string } {
  const currentHour = now.getHours();
  let closest = profile.dailyRoutine[0];
  let minDiff = Infinity;

  for (const item of profile.dailyRoutine) {
    const itemHour = parseInt(item.time.split(':')[0]);
    const diff = Math.abs(currentHour - itemHour);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest;
}

/**
 * Generate a batch of rich posts for a character (on-demand).
 */
export async function generateFeedBatch(
  characterId: string,
  count: number = 5
): Promise<any[]> {
  const postTypes = ['life_moment', 'life_moment', 'cultural_question', 'language_challenge', 'life_moment'];
  const posts: any[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const postType = postTypes[i % postTypes.length];
      const postData = await generateFeedPost(characterId, postType);

      // Persist to DB
      const hoursAgo = Math.floor(Math.random() * 48) + 1;
      const publishedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const dbPost = await prisma.lifestyleFeedPost.create({
        data: {
          characterId,
          type: postType,
          content: JSON.stringify(postData),
          isPublished: true,
          publishedAt,
        },
      });

      posts.push({
        id: dbPost.id,
        characterId,
        type: postType,
        ...postData,
        publishedAt: dbPost.publishedAt,
        interactionCount: 0,
      });
    } catch (err) {
      console.error(`[feed] Error generating post ${i} for ${characterId}:`, err);
    }
  }

  return posts;
}

/**
 * Schedule feed content for all characters.
 * Called daily via cron job.
 */
export async function scheduleFeedContent(): Promise<void> {
  const characters = ['akari', 'mina', 'sophie', 'carlos'];
  const postTypes = [
    'life_moment',
    'life_moment',
    'cultural_question',
    'language_challenge',
  ];

  for (const characterId of characters) {
    const postCount = Math.random() > 0.5 ? 2 : 1;

    for (let i = 0; i < postCount; i++) {
      const postType =
        postTypes[Math.floor(Math.random() * postTypes.length)];
      const postData = await generateFeedPost(characterId, postType);

      await prisma.lifestyleFeedPost.create({
        data: {
          characterId,
          type: postType,
          content: JSON.stringify(postData),
          isPublished: false,
          publishedAt: getScheduledTime(characterId, i),
        },
      });
    }
  }
}

function getScheduledTime(characterId: string, index: number): Date {
  const timezones: Record<string, number> = {
    akari: 9,
    mina: 9,
    sophie: 1,
    carlos: -3,
  };
  const offset = timezones[characterId] || 0;
  const now = new Date();
  const postHours = [10, 19];
  const postHour = postHours[index] || 10;
  const utcHour = (postHour - offset + 24) % 24;
  const scheduled = new Date(now);
  scheduled.setHours(utcHour, Math.floor(Math.random() * 30), 0, 0);
  return scheduled;
}

/**
 * Get published feed posts, optionally filtered by character.
 */
export async function getFeedPosts(
  page: number = 1,
  characterId?: string,
  userId?: string
) {
  const where: any = {
    isPublished: true,
    publishedAt: { lte: new Date() },
  };
  if (characterId) where.characterId = characterId;

  const posts = await prisma.lifestyleFeedPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: 20,
    skip: (page - 1) * 20,
    include: {
      interactions: userId
        ? { where: { userId }, take: 1 }
        : false,
    },
  });

  return posts.map((p) => {
    const content = JSON.parse(p.content);
    const userInteractions = (p as any).interactions || [];
    return {
      id: p.id,
      characterId: p.characterId,
      type: p.type,
      ...content,
      imageUrl: p.imageUrl,
      publishedAt: p.publishedAt,
      interactionCount: p.interactionCount,
      userLiked: userInteractions.some((i: any) => i.type === 'like'),
      userReplied: userInteractions.some((i: any) => i.type === 'reply'),
      userSaved: userInteractions.some((i: any) => i.type === 'save'),
    };
  });
}

/**
 * Record a user interaction with a feed post.
 */
export async function interactWithPost(
  userId: string,
  postId: string,
  type: 'like' | 'reply' | 'save',
  replyText?: string
) {
  const interaction = await prisma.feedInteraction.create({
    data: {
      userId,
      postId,
      type,
      replyText,
    },
  });

  await prisma.lifestyleFeedPost.update({
    where: { id: postId },
    data: { interactionCount: { increment: 1 } },
  });

  // If user replied, generate AI follow-up
  if (type === 'reply' && replyText) {
    const post = await prisma.lifestyleFeedPost.findUnique({
      where: { id: postId },
    });
    if (post) {
      const postContent = JSON.parse(post.content);
      const followUp = await completeHaiku(
        `You are ${post.characterId}. A user replied "${replyText}" to your social media post: "${postContent.caption}". 
Write a short, warm reply (1-2 sentences) in your character voice, mixing English and your native language.`,
        100
      );

      await prisma.feedInteraction.update({
        where: { id: interaction.id },
        data: { aiFollowUp: followUp },
      });

      return { ...interaction, aiFollowUp: followUp };
    }
  }

  return interaction;
}
