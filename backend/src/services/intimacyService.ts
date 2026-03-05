import prisma from '../lib/prisma';

// ===== Intimacy Scoring Service =====

/**
 * Intimacy level thresholds matching the PRD spec.
 */
const INTIMACY_LEVELS = [
  { level: 0, name: 'New',      minScore: 0,   maxScore: 15 },
  { level: 1, name: 'Warm',     minScore: 16,  maxScore: 40 },
  { level: 2, name: 'Close',    minScore: 41,  maxScore: 70 },
  { level: 3, name: 'Intimate', minScore: 71,  maxScore: 100 },
  { level: 4, name: 'Bonded',   minScore: 101, maxScore: Infinity },
];

/**
 * Score adjustments for different interaction types.
 */
const SCORE_WEIGHTS: Record<string, number> = {
  text_message:        1,
  voice_message:       3,
  inner_voice_reveal:  2,
  feed_reply:          2,
  feed_like:           0.5,
  journal_save:        1,
  daily_login:         2,
  voice_call:          5,
  bedtime_story:       3,
  vulnerability_share: 4,
  // Module H: Proactive presence
  proactive_reply:     3,   // User replied to a proactive message
  birthday_interaction: 5,  // Birthday experience interaction
  // Module I: Deep cognition
  reflection_answer:   2,   // User answered a daily reflection question
  deep_recall_response: 3,  // User engaged with a deep memory recall
  // Module H: Gifts
  gift_received:       2,   // Character sent a gift (passive)
  gift_opened:         3,   // User opened a gift
};

/**
 * Add intimacy points based on an interaction type.
 */
export async function addIntimacy(
  relationshipId: string,
  interactionType: string
): Promise<{ newScore: number; newLevel: number; levelChanged: boolean }> {
  const points = SCORE_WEIGHTS[interactionType] || 1;

  const relationship = await prisma.relationship.update({
    where: { id: relationshipId },
    data: {
      intimacyScore: { increment: points },
      totalMessages: interactionType === 'text_message'
        ? { increment: 1 }
        : undefined,
      lastActiveAt: new Date(),
    },
  });

  const newLevel = getLevel(relationship.intimacyScore);
  const levelChanged = newLevel !== relationship.intimacyLevel;

  if (levelChanged) {
    await prisma.relationship.update({
      where: { id: relationshipId },
      data: { intimacyLevel: newLevel },
    });
  }

  return {
    newScore: relationship.intimacyScore,
    newLevel,
    levelChanged,
  };
}

/**
 * Decay intimacy for inactive users. Called daily.
 */
export async function decayInactiveRelationships(): Promise<void> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const inactive = await prisma.relationship.findMany({
    where: {
      lastActiveAt: { lt: threeDaysAgo },
      intimacyScore: { gt: 5 },
    },
  });

  for (const rel of inactive) {
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(rel.lastActiveAt).getTime()) /
        (24 * 60 * 60 * 1000)
    );
    const decay = Math.min(daysSinceActive - 2, 5); // Max 5 points decay per day

    await prisma.relationship.update({
      where: { id: rel.id },
      data: {
        intimacyScore: Math.max(0, rel.intimacyScore - decay),
      },
    });
  }
}

/**
 * Get or create a relationship for a user-character pair.
 */
export async function getOrCreateRelationship(
  userId: string,
  characterId: string
) {
  let relationship = await prisma.relationship.findUnique({
    where: {
      userId_characterId: { userId, characterId },
    },
  });

  if (!relationship) {
    relationship = await prisma.relationship.create({
      data: { userId, characterId },
    });
  }

  return relationship;
}

function getLevel(score: number): number {
  for (let i = INTIMACY_LEVELS.length - 1; i >= 0; i--) {
    if (score >= INTIMACY_LEVELS[i].minScore) return INTIMACY_LEVELS[i].level;
  }
  return 0;
}
