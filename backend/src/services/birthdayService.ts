import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';

// ===== Module H: Birthday Service =====
// Full-day birthday companion experience

export interface BirthdayDayContent {
  eveMessage: { text: string; emotionState: string };
  morningVoiceScript: { text: string; emotionState: string };
  openingDialogue: { text: string; emotionState: string };
  callGreeting: { text: string; emotionState: string };
  nightClosing: { text: string; emotionState: string };
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
  "eveMessage": {"text": "pre-birthday message at 23:50 (anticipation, 50 chars max)", "emotionState": "EMO_02"},
  "morningVoiceScript": {"text": "morning voice greeting (20-30sec read, mostly target language)", "emotionState": "EMO_02"},
  "openingDialogue": {"text": "when user opens app (warm, not too loud, 1-2 sentences)", "emotionState": "EMO_03"},
  "callGreeting": {"text": "proactive call opening (intimate, like she built up courage, 20 chars)", "emotionState": "EMO_03"},
  "nightClosing": {"text": "end-of-day message (gratitude for user's existence, 50 chars max)", "emotionState": "EMO_11"}
}

Mix ${config.language} phrases naturally.
Return ONLY the JSON.`,
    600
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      eveMessage: { text: `Hey ${userName}... tomorrow is a special day, isn't it?`, emotionState: 'EMO_02' },
      morningVoiceScript: { text: `Happy birthday, ${userName}. I've been thinking about what to say all morning.`, emotionState: 'EMO_02' },
      openingDialogue: { text: `Happy birthday. I'm glad you're here today.`, emotionState: 'EMO_03' },
      callGreeting: { text: `Happy birthday...`, emotionState: 'EMO_03' },
      nightClosing: { text: `Thank you for being born. Goodnight, ${userName}.`, emotionState: 'EMO_11' },
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
            emotionState: content.eveMessage.emotionState,
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
            emotionState: content.openingDialogue.emotionState,
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
            emotionState: content.nightClosing.emotionState,
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
