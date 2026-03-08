import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';
import { inferEmotionKeyFromText } from './emotionEngine';

// ===== Module H: Birthday Service =====
// Full-day birthday companion experience

export interface BirthdayDayContent {
  eveMessage: { text: string; emotionKey: string };
  morningVoiceScript: { text: string; emotionKey: string };
  openingDialogue: { text: string; emotionKey: string };
  callGreeting: { text: string; emotionKey: string };
  nightClosing: { text: string; emotionKey: string };
}

/**
 * Generate full-day birthday content for a user.
 */
export async function generateBirthdayDayContent(
  userId: string,
  characterId: string
): Promise<BirthdayDayContent> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  const config = getCharacterConfig(characterId);
  const userName = user?.username || 'you';

  // Check if user mentioned birthday wishes in past conversations
  const birthdayMemories = await prisma.memory.findMany({
    where: {
      relationship: { userId, characterId },
      tags: { contains: 'birthday' },
    },
    take: 3,
  });

  const birthdayWish = birthdayMemories.length > 0
    ? birthdayMemories.map((m) => m.content).join('; ')
    : null;

  const result = await completeHaiku(
    `You are ${config.name}. Today is ${userName}'s birthday.
Character language: ${config.language}
${birthdayWish ? `User's past birthday wish: "${birthdayWish}"` : 'No birthday wish on record.'}

Generate 5 birthday messages for different times of day (JSON):
{
  "eveMessage": {"text": "pre-birthday message at 23:50 (anticipation, 50 chars max)", "emotionKey": "anticipation"},
  "morningVoiceScript": {"text": "morning voice greeting (20-30sec read, mostly target language)", "emotionKey": "delight"},
  "openingDialogue": {"text": "when user opens app (warm, not too loud, 1-2 sentences)", "emotionKey": "affection"},
  "callGreeting": {"text": "proactive call opening (intimate, like she built up courage, 20 chars)", "emotionKey": "elevation"},
  "nightClosing": {"text": "end-of-day message (gratitude for user's existence, 50 chars max)", "emotionKey": "gratitude"}
}

Mix ${config.language} phrases naturally.
Return ONLY the JSON.`,
    600
  );

  try {
    const parsed = JSON.parse(result) as BirthdayDayContent;
    return {
      eveMessage: {
        text: parsed.eveMessage?.text || '',
        emotionKey: parsed.eveMessage?.emotionKey
          || inferEmotionKeyFromText(parsed.eveMessage?.text || '', { triggerType: 'birthday' }),
      },
      morningVoiceScript: {
        text: parsed.morningVoiceScript?.text || '',
        emotionKey: parsed.morningVoiceScript?.emotionKey
          || inferEmotionKeyFromText(parsed.morningVoiceScript?.text || '', { triggerType: 'birthday' }),
      },
      openingDialogue: {
        text: parsed.openingDialogue?.text || '',
        emotionKey: parsed.openingDialogue?.emotionKey
          || inferEmotionKeyFromText(parsed.openingDialogue?.text || '', { triggerType: 'birthday' }),
      },
      callGreeting: {
        text: parsed.callGreeting?.text || '',
        emotionKey: parsed.callGreeting?.emotionKey
          || inferEmotionKeyFromText(parsed.callGreeting?.text || '', { triggerType: 'birthday' }),
      },
      nightClosing: {
        text: parsed.nightClosing?.text || '',
        emotionKey: parsed.nightClosing?.emotionKey
          || inferEmotionKeyFromText(parsed.nightClosing?.text || '', { triggerType: 'birthday' }),
      },
    };
  } catch {
    return {
      eveMessage: { text: `Hey ${userName}... tomorrow is a special day, isn't it?`, emotionKey: 'anticipation' },
      morningVoiceScript: { text: `Happy birthday, ${userName}. I've been thinking about what to say all morning.`, emotionKey: 'delight' },
      openingDialogue: { text: `Happy birthday. I'm glad you're here today.`, emotionKey: 'affection' },
      callGreeting: { text: `Happy birthday...`, emotionKey: 'elevation' },
      nightClosing: { text: `Thank you for being born. Goodnight, ${userName}.`, emotionKey: 'gratitude' },
    };
  }
}

/**
 * Check if any user has a birthday today and generate content.
 */
export async function checkBirthdays(): Promise<void> {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Find users with birthdays today
  const users = await prisma.user.findMany({
    where: {
      birthday: { not: null },
    },
    include: {
      relationships: {
        select: { characterId: true, userId: true },
      },
    },
  });

  for (const user of users) {
    if (!user.birthday) continue;
    const bday = new Date(user.birthday);
    if (bday.getMonth() + 1 !== month || bday.getDate() !== day) continue;

    // Generate birthday content for each active relationship
    for (const rel of user.relationships) {
      try {
        const content = await generateBirthdayDayContent(
          user.id,
          rel.characterId
        );

        // Schedule birthday proactive messages
        const baseDate = new Date();

        // Eve message (if birthday is tomorrow, schedule for tonight)
        await prisma.proactiveMessage.create({
          data: {
            userId: user.id,
            characterId: rel.characterId,
            triggerType: 'birthday',
            content: content.eveMessage.text,
            emotionKey: content.eveMessage.emotionKey,
            scheduledAt: new Date(baseDate.setHours(8, 0, 0, 0)),
          },
        });

        // Morning greeting
        await prisma.proactiveMessage.create({
          data: {
            userId: user.id,
            characterId: rel.characterId,
            triggerType: 'birthday',
            content: content.openingDialogue.text,
            emotionKey: content.openingDialogue.emotionKey,
            scheduledAt: new Date(baseDate.setHours(12, 0, 0, 0)),
          },
        });

        // Night closing
        await prisma.proactiveMessage.create({
          data: {
            userId: user.id,
            characterId: rel.characterId,
            triggerType: 'birthday',
            content: content.nightClosing.text,
            emotionKey: content.nightClosing.emotionKey,
            scheduledAt: new Date(baseDate.setHours(23, 0, 0, 0)),
          },
        });

        console.log(`[birthday] Generated birthday content for user ${user.id} / ${rel.characterId}`);
      } catch (err) {
        console.error(`[birthday] Failed for user ${user.id}:`, err);
      }
    }
  }
}

/**
 * Create a birthday journal entry automatically.
 */
export async function createBirthdayJournalEntry(
  userId: string,
  characterId: string,
  birthdayContent: BirthdayDayContent
): Promise<void> {
  await prisma.journalEntry.create({
    data: {
      userId,
      characterId,
      entryType: 'milestone',
      title: `🎂 Birthday`,
      content: JSON.stringify({
        type: 'birthday',
        morningMessage: birthdayContent.openingDialogue.text,
        nightMessage: birthdayContent.nightClosing.text,
        specialCg: true,
      }),
      stickerIds: JSON.stringify(['birthday_cake']),
    },
  });
}
