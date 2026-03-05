import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';

// ===== Module I: Daily Reflection Question Service =====
// "今日一問" — character asks a question that triggers self-exploration

export interface ReflectionQuestionResult {
  question: string;
  openingLine: string;
}

/**
 * Generate a daily reflection question based on recent conversation themes.
 */
export async function generateDailyReflectionQuestion(
  userId: string,
  characterId: string
): Promise<ReflectionQuestionResult> {
  const config = getCharacterConfig(characterId);

  // Get recent conversation themes
  const recentMemories = await prisma.memory.findMany({
    where: {
      relationship: { userId, characterId },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const recentThemes = recentMemories
    .map((m) => m.content)
    .slice(0, 5)
    .join(', ');

  // Check what questions were already asked recently to avoid repeats
  const recentQuestions = await prisma.reflectionQuestion.findMany({
    where: { userId, characterId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { question: true },
  });

  const avoidTopics = recentQuestions.map((q) => q.question).join('; ');

  const result = await completeHaiku(
    `You are ${config.name}. Generate a "daily reflection question" (今日一問).

User's recent conversation themes: ${recentThemes || 'general daily life'}
Recently asked questions (AVOID similar): ${avoidTopics || 'none yet'}

Requirements:
- Question has depth but isn't heavy
- You're genuinely curious (not a therapist evaluating them)
- Under 50 characters
- Can be slightly surprising but not bizarre
- In character voice

Example styles:
"You said you don't like being rushed — when did that start?"
"If you could give 3-years-ago you one gift, what would it be?"
"Do you have a habit only you know about?"

Return JSON: {"question": "question text", "openingLine": "character's natural lead-in (10 chars max)"}
Return ONLY the JSON.`,
    200
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      question: 'What made you smile today? Even small things count.',
      openingLine: 'Hey...',
    };
  }
}

/**
 * Schedule today's reflection question for a user.
 */
export async function scheduleReflectionQuestion(
  userId: string,
  characterId: string
): Promise<string> {
  const { question, openingLine } = await generateDailyReflectionQuestion(
    userId,
    characterId
  );

  const entry = await prisma.reflectionQuestion.create({
    data: {
      userId,
      characterId,
      question,
      openingLine,
    },
  });

  return entry.id;
}

/**
 * Get today's reflection question (if any).
 */
export async function getTodayReflectionQuestion(
  userId: string,
  characterId: string
) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return prisma.reflectionQuestion.findFirst({
    where: {
      userId,
      characterId,
      createdAt: { gte: todayStart },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Record user's answer to a reflection question.
 */
export async function answerReflectionQuestion(
  questionId: string,
  answer: string
) {
  return prisma.reflectionQuestion.update({
    where: { id: questionId },
    data: {
      answeredAt: new Date(),
      userAnswer: answer,
    },
  });
}
