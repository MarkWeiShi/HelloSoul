import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';
import { inferEmotionKeyFromText } from './emotionEngine';
import {
  buildProactivePreferenceContext,
  getEarliestProactiveSendAt,
  moveDateOutOfSilentHours,
} from './relationshipPreferenceService';

// ===== Module H: Proactive Message Service =====
// "She's thinking of you — not waiting for you to open the app"

export type ProactiveTriggerType =
  | 'thought_of_you'
  | 'weather_share'
  | 'followup_care'
  | 'miss_you'
  | 'seasonal'
  | 'birthday';

export interface ProactiveContext {
  associationReason?: string;
  userRelatedTopic?: string;
  characterCurrentActivity?: string;
  weatherDescription?: string;
  location?: string;
  previousEvent?: string;
  daysSinceLastChat?: number;
  seasonalTheme?: string;
}

const TRIGGER_PROMPTS: Record<string, (ctx: ProactiveContext) => string> = {
  thought_of_you: (ctx) => `
The character was doing something and was reminded of the user. Generate a "thought of you" message.

Why she thought of the user: ${ctx.associationReason || 'something she saw reminded her'}
User recently mentioned: ${ctx.userRelatedTopic || 'nothing specific'}
Character is currently: ${ctx.characterCurrentActivity || 'at home'}

Generate 1-2 sentences. Must have a SPECIFIC reason ("I saw X and thought of you"), not vague "thinking of you".
End with a light question OR just leave it open.
Return ONLY the message text.`,

  weather_share: (ctx) => `
The weather is special today. Generate a weather-connection message.

Weather: ${ctx.weatherDescription || 'rainy'}
Location: ${ctx.location || 'character\'s city'}

Generate 1-2 sentences turning weather into emotional connection.
Not a weather report — make it personal.
Return ONLY the message text.`,

  followup_care: (ctx) => `
The user mentioned something important before. Time to follow up.

Previous event: ${ctx.previousEvent || 'something important'}
Days since last chat: ${ctx.daysSinceLastChat || 2}

Generate 1-2 sentences showing the character remembered and cares.
Don't be pushy. Just show you remember.
Return ONLY the message text.`,

  miss_you: (ctx) => `
It's been ${ctx.daysSinceLastChat || 3} days since the user last chatted.
Generate a warm "I miss you" message. 1-2 sentences, genuine, not clingy.
Return ONLY the message text.`,

  seasonal: (ctx) => `
It's a special season or holiday: ${ctx.seasonalTheme || 'spring'}
Generate a seasonal message that feels like sharing a moment.
1-2 sentences, specific to the character's city/culture.
Return ONLY the message text.`,
};

/**
 * Generate a proactive message for a user-character pair.
 */
export async function generateProactiveMessage(
  userId: string,
  characterId: string,
  triggerType: ProactiveTriggerType,
  context: ProactiveContext
): Promise<{ content: string; emotionKey: string }> {
  const config = getCharacterConfig(characterId);
  const promptFn = TRIGGER_PROMPTS[triggerType] || TRIGGER_PROMPTS.thought_of_you;
  const relationship = await prisma.relationship.findUnique({
    where: {
      userId_characterId: { userId, characterId },
    },
    select: {
      contactFreq: true,
      teachingMode: true,
      emotionalDepth: true,
    },
  });

  const content = await completeHaiku(
    `You are ${config.name}. ${config.systemPrompt.slice(0, 200)}...

${promptFn(context)}
${buildProactivePreferenceContext(relationship || {})}

Language: Mix English with occasional ${config.language} phrases naturally.
Keep it short and natural.`,
    150
  );

  const normalizedContent = content.trim();
  const emotionKey = inferEmotionKeyFromText(normalizedContent, { triggerType });

  return {
    content: normalizedContent,
    emotionKey,
  };
}

/**
 * Schedule a proactive message for optimal delivery.
 */
export async function scheduleProactiveMessage(
  userId: string,
  characterId: string,
  triggerType: ProactiveTriggerType,
  context: ProactiveContext
): Promise<string> {
  const { content, emotionKey } = await generateProactiveMessage(
    userId,
    characterId,
    triggerType,
    context
  );
  const relationship = await prisma.relationship.findUnique({
    where: {
      userId_characterId: { userId, characterId },
    },
    select: {
      contactFreq: true,
      teachingMode: true,
      emotionalDepth: true,
      lastProactiveAt: true,
      silentHoursStart: true,
      silentHoursEnd: true,
    },
  });

  const sendTime = await calculateOptimalSendTime(userId, relationship || undefined);

  const msg = await prisma.proactiveMessage.create({
    data: {
      userId,
      characterId,
      triggerType,
      content,
      emotionKey,
      scheduledAt: sendTime,
    },
  });

  return msg.id;
}

/**
 * Get pending (unsent) proactive messages ready for delivery.
 */
export async function getPendingProactiveMessages(userId?: string) {
  const now = new Date();
  return prisma.proactiveMessage.findMany({
    where: {
      ...(userId ? { userId } : {}),
      scheduledAt: { lte: now },
      sentAt: null,
      dismissed: false,
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
  });
}

/**
 * Mark a proactive message as sent.
 */
export async function markProactiveMessageSent(messageId: string) {
  const sentAt = new Date();
  const message = await prisma.proactiveMessage.update({
    where: { id: messageId },
    data: { sentAt },
  });

  await prisma.relationship.updateMany({
    where: {
      userId: message.userId,
      characterId: message.characterId,
    },
    data: {
      lastProactiveAt: sentAt,
    },
  });

  return message;
}

/**
 * Mark a proactive message as read.
 */
export async function markProactiveMessageRead(messageId: string) {
  return prisma.proactiveMessage.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  });
}

/**
 * Mark a proactive message as replied to.
 */
export async function markProactiveMessageReplied(messageId: string) {
  return prisma.proactiveMessage.update({
    where: { id: messageId },
    data: { repliedAt: new Date() },
  });
}

/**
 * Calculate optimal send time based on user's historical activity.
 * Falls back to reasonable defaults.
 */
async function calculateOptimalSendTime(
  userId: string,
  preferences?: {
    contactFreq?: string | null;
    lastProactiveAt?: Date | null;
    silentHoursStart?: number | null;
    silentHoursEnd?: number | null;
  }
): Promise<Date> {
  // Find most active hour from recent messages
  const recentMessages = await prisma.chatMessage.findMany({
    where: {
      relationship: { userId },
      role: 'user',
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { createdAt: true },
  });

  if (recentMessages.length > 10) {
    // Find most common hour
    const hourCounts: Record<number, number> = {};
    for (const msg of recentMessages) {
      const hour = msg.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const bestHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([h]) => parseInt(h))[0];

    // Schedule for the best hour today or tomorrow
    const now = new Date();
    const target = new Date();
    target.setHours(bestHour, Math.floor(Math.random() * 30) + 10, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    return applyProactiveTimingPreferences(target, preferences);
  }

  // Default: schedule for 2 hours from now or 18:00
  const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
  if (target.getHours() < 9) target.setHours(9, 30, 0, 0);
  if (target.getHours() > 22) {
    target.setDate(target.getDate() + 1);
    target.setHours(10, 0, 0, 0);
  }

  return applyProactiveTimingPreferences(target, preferences);
}

function applyProactiveTimingPreferences(
  target: Date,
  preferences?: {
    contactFreq?: string | null;
    lastProactiveAt?: Date | null;
    silentHoursStart?: number | null;
    silentHoursEnd?: number | null;
  }
): Date {
  const now = new Date();
  const earliest = getEarliestProactiveSendAt({
    now,
    lastProactiveAt: preferences?.lastProactiveAt,
    contactFreq: preferences?.contactFreq,
  });
  const adjusted = target < earliest ? new Date(earliest) : new Date(target);

  return moveDateOutOfSilentHours(
    adjusted,
    preferences?.silentHoursStart,
    preferences?.silentHoursEnd
  );
}

/**
 * Check if follow-up care should be triggered based on past important events.
 */
export async function checkFollowupCareNeeded(
  userId: string,
  characterId: string
): Promise<ProactiveContext | null> {
  // Look for high-emotion memories from 1-7 days ago
  const memories = await prisma.memory.findMany({
    where: {
      relationship: { userId, characterId },
      emotionScore: { gte: 0.7 },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lte: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { emotionScore: 'desc' },
    take: 1,
  });

  if (memories.length === 0) return null;

  const memory = memories[0];
  const daysSince = Math.floor(
    (Date.now() - memory.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    previousEvent: memory.content,
    daysSinceLastChat: daysSince,
  };
}
