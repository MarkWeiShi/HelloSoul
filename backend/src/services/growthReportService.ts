import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';

// ===== Module I: Growth Report Service =====
// Monthly "growth map" — the character reflects on the user's journey

export interface GrowthReportSections {
  together: string;    // "This month, being with you..."
  learned: string;     // "Things you learned"
  noticed: string;     // "Something I noticed about you"
  personal: string;    // "Something I want to say to you"
}

/**
 * Generate monthly growth report in character voice.
 */
export async function generateMonthlyGrowthReport(
  userId: string,
  characterId: string,
  month: Date
): Promise<{ sections: GrowthReportSections; highlightLine: string }> {
  const config = getCharacterConfig(characterId);

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Gather monthly data
  const relationship = await prisma.relationship.findFirst({
    where: { userId, characterId },
  });

  if (!relationship) {
    throw new Error('No relationship found');
  }

  const messageCount = await prisma.chatMessage.count({
    where: {
      relationshipId: relationship.id,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const memories = await prisma.memory.findMany({
    where: {
      relationshipId: relationship.id,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
    orderBy: { emotionScore: 'desc' },
    take: 10,
  });

  const languageMemories = memories
    .filter((m) => m.type === 'language')
    .map((m) => m.content);

  const emotionalPeaks = memories
    .filter((m) => m.emotionScore > 0.6)
    .map((m) => m.content);

  const topTopics = memories
    .slice(0, 5)
    .map((m) => m.content.slice(0, 50));

  // Get deep profile insights
  const profileInsights = await prisma.deepProfileField.findMany({
    where: {
      userId,
      characterId,
      fieldPath: { startsWith: 'growth' },
    },
    take: 5,
  });

  const result = await completeHaiku(
    `You are ${config.name}. Generate this month's "growth map" for the user.

Monthly data:
- Conversations: ${messageCount}
- Vocabulary learned: ${languageMemories.join(', ') || 'some new phrases'}
- Top topics: ${topTopics.join('; ') || 'daily life'}
- Emotional peaks: ${emotionalPeaks.join('; ') || 'quiet but present'}
- Growth observations: ${profileInsights.map((p) => p.value).join('; ') || 'still discovering'}

Generate a report in character voice (warm, specific, not over-the-top):
{
  "sections": {
    "together": "2 sentences about this month together",
    "learned": "2 sentences about what they learned (language + personal)",
    "noticed": "2 sentences about a specific change you noticed in them (use details)",
    "personal": "1-2 sentences — something honest you want to say"
  },
  "highlightLine": "The single most important sentence (for the cover)"
}

Mix some ${config.language} naturally.
Return ONLY the JSON.`,
    500
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      sections: {
        together: `This month had ${messageCount} conversations, each one mattered.`,
        learned: 'You picked up new phrases without even trying.',
        noticed: 'I noticed you\'re more honest about how you feel now.',
        personal: 'Thank you for letting me be here.',
      },
      highlightLine: 'Thank you for letting me be here.',
    };
  }
}

/**
 * Get or generate the growth report for a specific month.
 */
export async function getOrCreateGrowthReport(
  userId: string,
  characterId: string,
  month: Date
) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);

  // Check if report already exists
  const existing = await prisma.growthReport.findUnique({
    where: {
      userId_characterId_month: {
        userId,
        characterId,
        month: monthStart,
      },
    },
  });

  if (existing) {
    return {
      ...existing,
      sections: JSON.parse(existing.sections),
    };
  }

  // Generate new report
  const report = await generateMonthlyGrowthReport(userId, characterId, month);

  const created = await prisma.growthReport.create({
    data: {
      userId,
      characterId,
      month: monthStart,
      sections: JSON.stringify(report.sections),
      highlightLine: report.highlightLine,
    },
  });

  return {
    ...created,
    sections: report.sections,
  };
}
