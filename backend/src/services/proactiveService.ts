import { scheduleFeedContent } from './feedService';
import { decayInactiveRelationships } from './intimacyService';
import {
  getPendingProactiveMessages,
  markProactiveMessageSent,
  checkFollowupCareNeeded,
  scheduleProactiveMessage,
} from './proactiveMessageService';
import { checkBirthdays } from './birthdayService';
import prisma from '../lib/prisma';

// ===== Proactive / Scheduled Service =====
// Handles heartbeat messages, daily feed scheduling, intimacy decay, proactive triggers, birthdays.

/**
 * Initialize all scheduled jobs.
 * Uses setInterval with time checks (upgrade to node-cron in production).
 */
export function initScheduledJobs() {
  // Schedule feed content generation daily at midnight UTC
  scheduleDaily(0, 0, async () => {
    console.log('[proactive] Generating daily feed content...');
    await scheduleFeedContent();
    console.log('[proactive] Feed content generated.');
  });

  // Decay inactive relationships daily at 3 AM UTC
  scheduleDaily(3, 0, async () => {
    console.log('[proactive] Running intimacy decay...');
    await decayInactiveRelationships();
    console.log('[proactive] Intimacy decay complete.');
  });

  // Check birthdays daily at 7 AM UTC
  scheduleDaily(7, 0, async () => {
    console.log('[proactive] Checking birthdays...');
    await checkBirthdays();
    console.log('[proactive] Birthday check complete.');
  });

  // Check for follow-up care needs every 4 hours
  scheduleInterval(4 * 60 * 60 * 1000, async () => {
    console.log('[proactive] Checking follow-up care needs...');
    await scheduleFollowupCareMessages();
    console.log('[proactive] Follow-up care check complete.');
  });

  // Check for miss-you triggers every 6 hours
  scheduleInterval(6 * 60 * 60 * 1000, async () => {
    console.log('[proactive] Checking miss-you triggers...');
    await scheduleMissYouMessages();
    console.log('[proactive] Miss-you check complete.');
  });

  // Process pending proactive messages every 5 minutes
  scheduleInterval(5 * 60 * 1000, async () => {
    await processPendingProactiveMessages();
  });

  console.log('[proactive] Scheduled jobs initialized (feed, decay, birthdays, proactive).');
}

/**
 * Simple daily scheduler using setInterval + time check.
 */
function scheduleDaily(hour: number, minute: number, fn: () => Promise<void>) {
  const checkInterval = 60 * 1000; // Check every minute

  setInterval(async () => {
    const now = new Date();
    if (now.getUTCHours() === hour && now.getUTCMinutes() === minute) {
      try {
        await fn();
      } catch (err) {
        console.error('[proactive] Scheduled job error:', err);
      }
    }
  }, checkInterval);
}

/**
 * Simple interval scheduler.
 */
function scheduleInterval(intervalMs: number, fn: () => Promise<void>) {
  setInterval(async () => {
    try {
      await fn();
    } catch (err) {
      console.error('[proactive] Interval job error:', err);
    }
  }, intervalMs);
}

/**
 * Process and "send" pending proactive messages (mark as sent for client polling).
 */
async function processPendingProactiveMessages() {
  const pending = await getPendingProactiveMessages();
  for (const msg of pending) {
    await markProactiveMessageSent(msg.id);
    console.log(`[proactive] Sent proactive message ${msg.id} to user ${msg.userId}`);
  }
}

/**
 * Check all active relationships for follow-up care needs.
 */
async function scheduleFollowupCareMessages() {
  const recentRelationships = await prisma.relationship.findMany({
    where: {
      lastActiveAt: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Active in last 14 days
      },
      proactiveFrequency: { not: 'off' },
    },
    select: { userId: true, characterId: true },
  });

  for (const rel of recentRelationships) {
    try {
      const context = await checkFollowupCareNeeded(rel.userId, rel.characterId);
      if (context) {
        await scheduleProactiveMessage(
          rel.userId,
          rel.characterId,
          'followup_care',
          context
        );
      }
    } catch (err) {
      // Skip individual failures
    }
  }
}

/**
 * Check for users who haven't chatted in 3+ days and send miss-you messages.
 */
async function scheduleMissYouMessages() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const inactiveRelationships = await prisma.relationship.findMany({
    where: {
      lastActiveAt: {
        lt: threeDaysAgo,
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // But not too old
      },
      intimacyScore: { gte: 10 },
      proactiveFrequency: { not: 'off' },
      // Don't send if we already sent one recently
      OR: [
        { lastProactiveAt: null },
        {
          lastProactiveAt: {
            lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    select: { userId: true, characterId: true },
  });

  for (const rel of inactiveRelationships) {
    try {
      // Get last conversation topic
      const lastMessage = await prisma.chatMessage.findFirst({
        where: {
          relationship: { userId: rel.userId, characterId: rel.characterId },
          role: 'user',
        },
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true },
      });

      const daysSince = lastMessage
        ? Math.floor((Date.now() - lastMessage.createdAt.getTime()) / (24 * 60 * 60 * 1000))
        : 3;

      await scheduleProactiveMessage(
        rel.userId,
        rel.characterId,
        'miss_you',
        {
          daysSinceLastChat: daysSince,
          userRelatedTopic: lastMessage?.content.slice(0, 100),
        }
      );
    } catch (err) {
      // Skip individual failures
    }
  }
}

/**
 * Generate a proactive "thinking of you" message.
 * Called when 72h have passed since last activity.
 */
export async function generateMissYouMessage(
  characterId: string,
  lastTopic: string
): Promise<string> {
  const { completeHaiku } = await import('./claudeService');
  const { getCharacterConfig } = await import('../prompts/personas');
  const config = getCharacterConfig(characterId);

  return completeHaiku(
    `You are ${config.name}. It's been 3 days since the user last talked to you.
Last topic discussed: "${lastTopic}"
Generate a warm, slightly yearning "I miss you" voice message text (2-3 sentences).
Mix English and ${config.language}. Be genuine, not clingy.
Return ONLY the message text, no JSON.`,
    150
  );
}
