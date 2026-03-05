import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';

// ===== 4-Layer Memory System =====

/**
 * Build the memory context string to inject into the system prompt
 * before each conversation turn.
 */
export async function buildMemoryContext(
  relationshipId: string
): Promise<string> {
  const memories = await prisma.memory.findMany({
    where: { relationshipId },
    orderBy: [{ priority: 'asc' }, { emotionScore: 'desc' }],
    take: 30,
  });

  if (memories.length === 0) return '';

  const summary = await completeHaiku(
    `Summarize these user memories in 150 words as a natural companion's perspective.
Focus on: identity facts, emotional peaks, vulnerabilities (handle gently), shared jokes.
Mark vulnerable memories with [tender] prefix.
Memories: ${JSON.stringify(memories.slice(0, 20))}

Return: A natural first-person summary like "I know that [name] is... They once told me...
I remember when they felt vulnerable about... Our joke about... means a lot."`,
    300
  );

  return summary;
}

/**
 * Extract memories from a conversation turn using Haiku.
 */
export async function extractMemories(
  relationshipId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  const result = await completeHaiku(
    `Analyze this conversation exchange and extract any memorable information.
User said: "${userMessage}"
AI responded: "${aiResponse}"

Extract memories as JSON array. Each item:
{
  "type": "identity|preference|milestone|vulnerability|shared|language|daily",
  "content": "what to remember",
  "priority": "P0|P1|P2",
  "emotionScore": 0.0-1.0,
  "isVulnerable": boolean,
  "tags": ["tag1", "tag2"]
}

Rules:
- Only extract things worth remembering long-term
- P0: core identity facts (name, job, family)
- P1: emotional events, preferences, milestones
- P2: daily observations, casual mentions
- isVulnerable=true for sensitive/painful topics
- Return [] if nothing notable

Return ONLY the JSON array, no explanation.`,
    500
  );

  try {
    const memories = JSON.parse(result);
    if (!Array.isArray(memories)) return;

    for (const mem of memories) {
      await prisma.memory.create({
        data: {
          relationshipId,
          type: mem.type || 'daily',
          content: mem.content,
          priority: mem.priority || 'P2',
          emotionScore: mem.emotionScore || 0,
          isVulnerable: mem.isVulnerable || false,
          tags: JSON.stringify(mem.tags || []),
          expiresAt:
            mem.priority === 'P2'
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
        },
      });
    }
  } catch {
    // Parsing failed — skip silently
  }
}

/**
 * Check if a memory should be proactively recalled now.
 * Returns the best matching memory or null.
 */
export async function checkMemoryRecall(
  relationshipId: string,
  currentMessage: string
): Promise<{ id: string; content: string; createdAt: Date } | null> {
  const candidates = await prisma.memory.findMany({
    where: {
      relationshipId,
      priority: { in: ['P0', 'P1'] },
    },
  });

  if (candidates.length === 0) return null;

  const scored = candidates
    .map((m) => ({
      memory: m,
      score: calculateRecallScore(m, currentMessage),
    }))
    .filter((x) => x.score > 0.4)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0].memory;

  // Update recall count
  await prisma.memory.update({
    where: { id: best.id },
    data: {
      recallCount: { increment: 1 },
      lastRecalledAt: new Date(),
    },
  });

  return {
    id: best.id,
    content: best.content,
    createdAt: best.createdAt,
  };
}

function calculateRecallScore(memory: any, message: string): number {
  const keywords = extractKeywords(message);
  const memKeywords = extractKeywords(memory.content);
  const overlap = keywords.filter((k: string) =>
    memKeywords.includes(k)
  ).length;
  const recencyPenalty = Math.min(
    1,
    (Date.now() - new Date(memory.createdAt).getTime()) /
      (30 * 24 * 60 * 60 * 1000)
  );
  return (
    (overlap / Math.max(keywords.length, 1)) *
    (1 - recencyPenalty * 0.3) *
    (memory.isVulnerable ? 1.2 : 1)
  );
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Get the journal timeline for a character relationship.
 */
export async function getJournalTimeline(
  userId: string,
  characterId: string
) {
  return prisma.journalEntry.findMany({
    where: { userId, characterId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

/**
 * Record a milestone event.
 */
export async function recordMilestone(
  relationshipId: string,
  type: string,
  title: string,
  description: string,
  intimacyAtTime: number
) {
  return prisma.milestone.create({
    data: {
      relationshipId,
      type,
      title,
      description,
      intimacyAtTime,
    },
  });
}
