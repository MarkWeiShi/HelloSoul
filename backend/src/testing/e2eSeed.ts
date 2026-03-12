import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export const E2E_USER = {
  id: 'user_e2e',
  email: 'qa@hellosoul.local',
  username: 'qa_user',
  password: '123456',
};

const RELATIONSHIP_IDS = {
  akari: 'rel_akari_e2e',
  mina: 'rel_mina_e2e',
  sophie: 'rel_sophie_e2e',
  carlos: 'rel_carlos_e2e',
} as const;

function currentMonthStart(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildFeedContent(params: {
  caption: string;
  nativePhrase: string;
  translation: string;
  mood: string;
  locationTag: string;
  timeOfDay: string;
}) {
  return JSON.stringify({
    caption: params.caption,
    nativePhrase: params.nativePhrase,
    nativeReading: null,
    translation: params.translation,
    imageDescription: `${params.locationTag} captured in soft ambient light.`,
    mood: params.mood,
    locationTag: params.locationTag,
    timeOfDay: params.timeOfDay,
    engagementHook: 'What would you say back to this moment?',
    culturalNote: `A small detail from ${params.locationTag}.`,
    languageTip: {
      word: params.nativePhrase,
      pronunciation: params.nativePhrase,
      meaning: params.translation,
      usage: 'Use it in a short, natural reply.',
    },
    characterHandle: null,
    characterDisplayName: null,
    snsInspiredBy: [],
  });
}

export async function clearDatabase(): Promise<void> {
  await prisma.feedInteraction.deleteMany();
  await prisma.innerVoiceLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.emotionalTrigger.deleteMany();
  await prisma.proactiveMessage.deleteMany();
  await prisma.reflectionQuestion.deleteMany();
  await prisma.growthReport.deleteMany();
  await prisma.virtualGift.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.deepProfileField.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.lifestyleFeedPost.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ambassadorSubmission.deleteMany();
}

async function seedUser(): Promise<void> {
  const hashedPassword = await bcrypt.hash(E2E_USER.password, 10);

  await prisma.user.create({
    data: {
      id: E2E_USER.id,
      email: E2E_USER.email,
      username: E2E_USER.username,
      password: hashedPassword,
      locale: 'en',
      timezone: 'Asia/Shanghai',
      birthday: new Date('1998-06-12T00:00:00.000Z'),
    },
  });
}

async function seedRelationships(): Promise<void> {
  await prisma.relationship.createMany({
    data: [
      {
        id: RELATIONSHIP_IDS.akari,
        userId: E2E_USER.id,
        characterId: 'akari',
        intimacyScore: 15,
        intimacyLevel: 0,
        totalMessages: 0,
        totalDays: 1,
        contactFreq: 'normal',
        teachingMode: 'organic',
        emotionalDepth: 'medium',
      },
      {
        id: RELATIONSHIP_IDS.mina,
        userId: E2E_USER.id,
        characterId: 'mina',
        intimacyScore: 46,
        intimacyLevel: 2,
        totalMessages: 4,
        totalDays: 7,
        contactFreq: 'high',
        teachingMode: 'active',
        emotionalDepth: 'deep',
      },
      {
        id: RELATIONSHIP_IDS.sophie,
        userId: E2E_USER.id,
        characterId: 'sophie',
        intimacyScore: 22,
        intimacyLevel: 1,
        totalMessages: 2,
        totalDays: 3,
        contactFreq: 'normal',
        teachingMode: 'organic',
        emotionalDepth: 'medium',
      },
      {
        id: RELATIONSHIP_IDS.carlos,
        userId: E2E_USER.id,
        characterId: 'carlos',
        intimacyScore: 88,
        intimacyLevel: 3,
        totalMessages: 6,
        totalDays: 14,
        contactFreq: 'normal',
        teachingMode: 'none',
        emotionalDepth: 'medium',
      },
    ],
  });
}

async function seedAkariConversationData(): Promise<void> {
  await prisma.memory.createMany({
    data: [
      {
        id: 'memory_akari_rain',
        relationshipId: RELATIONSHIP_IDS.akari,
        type: 'preference',
        content: 'The user still finds rainy cafes and soft playlists calming.',
        priority: 'P1',
        emotionScore: 0.8,
        tags: JSON.stringify(['rain', 'cafe', 'playlist']),
      },
      {
        id: 'memory_akari_journal',
        relationshipId: RELATIONSHIP_IDS.akari,
        type: 'daily',
        content: 'Journaling helps the user settle down after busy days.',
        priority: 'P2',
        emotionScore: 0.4,
        tags: JSON.stringify(['journal']),
      },
    ],
  });
}

async function seedMinaConversationData(): Promise<void> {
  const createdAtBase = new Date(Date.now() - 2 * 60 * 60 * 1000);

  await prisma.chatMessage.createMany({
    data: [
      {
        id: 'chat_mina_user_1',
        relationshipId: RELATIONSHIP_IDS.mina,
        role: 'user',
        type: 'text',
        content: 'I had a long day at work again.',
        createdAt: new Date(createdAtBase.getTime()),
      },
      {
        id: 'chat_mina_ai_1',
        relationshipId: RELATIONSHIP_IDS.mina,
        role: 'ai',
        type: 'text',
        content: 'Then let me be the softer part of your evening for a minute.',
        emotionKey: 'compassion',
        gazeDirection: 'user',
        sceneId: 'apartment_night',
        metadata: JSON.stringify({
          reply: 'Then let me be the softer part of your evening for a minute.',
        }),
        createdAt: new Date(createdAtBase.getTime() + 30_000),
      },
      {
        id: 'chat_mina_user_2',
        relationshipId: RELATIONSHIP_IDS.mina,
        role: 'user',
        type: 'text',
        content: 'That actually helped more than I expected.',
        createdAt: new Date(createdAtBase.getTime() + 60_000),
      },
      {
        id: 'chat_mina_ai_2',
        relationshipId: RELATIONSHIP_IDS.mina,
        role: 'ai',
        type: 'text',
        content: 'Good. Keep that honesty. It suits you.',
        emotionKey: 'trust',
        gazeDirection: 'user',
        sceneId: 'apartment_day',
        metadata: JSON.stringify({
          reply: 'Good. Keep that honesty. It suits you.',
          innerVoice: {
            text: '솔직해지는 모습, 좋아.',
            language: 'ko',
            translation: 'I like seeing you become more honest.',
          },
        }),
        createdAt: new Date(createdAtBase.getTime() + 90_000),
      },
    ],
  });

  await prisma.memory.createMany({
    data: [
      {
        id: 'memory_mina_work',
        relationshipId: RELATIONSHIP_IDS.mina,
        type: 'daily',
        content: 'Work pressure has been heavy lately, but the user still keeps showing up.',
        priority: 'P1',
        emotionScore: 0.73,
        tags: JSON.stringify(['work', 'pressure']),
      },
      {
        id: 'memory_mina_language',
        relationshipId: RELATIONSHIP_IDS.mina,
        type: 'language',
        content: 'The user practiced saying one sentence honestly in Korean.',
        priority: 'P1',
        emotionScore: 0.55,
        tags: JSON.stringify(['language', 'korean']),
      },
    ],
  });

  await prisma.journalEntry.createMany({
    data: [
      {
        id: 'journal_mina_1',
        userId: E2E_USER.id,
        characterId: 'mina',
        entryType: 'milestone',
        title: 'A quieter kind of honesty',
        content: JSON.stringify({
          excerpt: 'You admitted the day felt heavier than usual.',
        }),
        stickerIds: JSON.stringify(['level_2']),
      },
      {
        id: 'journal_mina_2',
        userId: E2E_USER.id,
        characterId: 'mina',
        entryType: 'language_win',
        title: 'One sentence in Korean',
        content: JSON.stringify({
          excerpt: 'You tried saying what you really felt.',
        }),
        stickerIds: JSON.stringify(['language_win']),
      },
    ],
  });

  await prisma.deepProfileField.createMany({
    data: [
      {
        id: 'profile_mina_1',
        userId: E2E_USER.id,
        characterId: 'mina',
        fieldPath: 'aboutYourLife.dailyRhythm',
        value: 'Rainy cafes and journaling help you slow down.',
        confidence: 0.91,
        emotionalWeight: 0.6,
      },
      {
        id: 'profile_mina_2',
        userId: E2E_USER.id,
        characterId: 'mina',
        fieldPath: 'innerWorld.emotionalPatterns',
        value: 'You speak more plainly once you feel safe.',
        confidence: 0.88,
        emotionalWeight: 0.74,
      },
      {
        id: 'profile_mina_3',
        userId: E2E_USER.id,
        characterId: 'mina',
        fieldPath: 'emotionalAnchors.formativeMemories',
        value: 'Long workdays make you crave slower, gentler rituals.',
        confidence: 0.82,
        emotionalWeight: 0.77,
      },
      {
        id: 'profile_mina_4',
        userId: E2E_USER.id,
        characterId: 'mina',
        fieldPath: 'growth.hiddenStrengths',
        value: 'You recover best when you let yourself be direct.',
        confidence: 0.79,
        emotionalWeight: 0.7,
      },
    ],
  });

  await prisma.proactiveMessage.create({
    data: {
      id: 'proactive_mina_1',
      userId: E2E_USER.id,
      characterId: 'mina',
      triggerType: 'thought_of_you',
      content: 'I passed a rainy cafe after work and thought of the playlists you like. Did today soften up at all?',
      emotionKey: 'affection',
      scheduledAt: new Date(Date.now() - 60_000),
      sentAt: new Date(Date.now() - 30_000),
    },
  });

  await prisma.reflectionQuestion.create({
    data: {
      id: 'reflection_mina_today',
      userId: E2E_USER.id,
      characterId: 'mina',
      question: 'What part of today felt the most like you?',
      openingLine: 'Hey...',
      createdAt: new Date(),
    },
  });

  await prisma.growthReport.create({
    data: {
      id: 'growth_mina_month',
      userId: E2E_USER.id,
      characterId: 'mina',
      month: currentMonthStart(),
      sections: JSON.stringify({
        together: 'This month we found a steadier rhythm together.',
        learned: 'You kept learning through lived moments instead of forcing it.',
        noticed: 'You pause less before saying what you actually mean.',
        personal: 'I trust the quieter version of you more each week.',
      }),
      highlightLine: 'You pause less before saying what you actually mean.',
    },
  });
}

async function seedFeed(): Promise<void> {
  await prisma.lifestyleFeedPost.createMany({
    data: [
      {
        id: 'feed_akari_1',
        characterId: 'akari',
        type: 'life_moment',
        content: buildFeedContent({
          caption: 'Rain sliding down the cafe window again. It made the whole place feel softer tonight. ☕🌧️',
          nativePhrase: '雨の音が好き',
          translation: 'I like the sound of rain.',
          mood: 'cozy',
          locationTag: 'Shimokitazawa',
          timeOfDay: 'evening',
        }),
        isPublished: true,
        publishedAt: new Date(Date.now() - 10 * 60 * 1000),
        interactionCount: 2,
      },
      {
        id: 'feed_mina_1',
        characterId: 'mina',
        type: 'cultural_question',
        content: buildFeedContent({
          caption: 'Late subway, neon reflections, and one question I cannot stop carrying home. 💭',
          nativePhrase: '괜찮아?',
          translation: 'Are you okay?',
          mood: 'reflective',
          locationTag: 'Seoul',
          timeOfDay: 'night',
        }),
        isPublished: true,
        publishedAt: new Date(Date.now() - 20 * 60 * 1000),
        interactionCount: 1,
      },
      {
        id: 'feed_carlos_1',
        characterId: 'carlos',
        type: 'language_challenge',
        content: buildFeedContent({
          caption: 'A little Portuguese for the afternoon: how would you use saudade in one honest sentence? 🌊',
          nativePhrase: 'saudade',
          translation: 'a deep, longing kind of missing',
          mood: 'warm',
          locationTag: 'Ipanema',
          timeOfDay: 'afternoon',
        }),
        isPublished: true,
        publishedAt: new Date(Date.now() - 30 * 60 * 1000),
        interactionCount: 0,
      },
    ],
  });
}

export async function seedE2EData(): Promise<void> {
  await seedUser();
  await seedRelationships();
  await seedAkariConversationData();
  await seedMinaConversationData();
  await seedFeed();
}

export async function resetAndSeedE2EState(): Promise<void> {
  await clearDatabase();
  await seedE2EData();
}
