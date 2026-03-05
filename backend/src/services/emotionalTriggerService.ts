import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';

// ===== Module B: Emotional Trigger Assessment Service =====
// Detects when user needs deeper emotional support (coach takeover trigger)

export interface TriggerAssessment {
  priority: 'P0' | 'P1' | 'P2' | 'none';
  reason: string;
  urgencyScore: number;
}

/**
 * Assess whether the current conversation warrants emotional support escalation.
 * P0 = must escalate (crisis), P1 = recommended, P2 = optional (positive milestone)
 */
export async function assessEmotionalTrigger(
  relationshipId: string,
  recentMessages: { role: string; content: string }[],
  intimacyScore: number
): Promise<TriggerAssessment> {
  const last3 = recentMessages.slice(-3);

  const result = await completeHaiku(
    `Analyze these recent user messages and assess emotional intensity.

Messages:
${last3.map((m) => `[${m.role}]: ${m.content}`).join('\n')}

User intimacy level: ${intimacyScore}/100

Assessment criteria:
- P0 (crisis): mentions breakup/job loss/death of loved one/crying/"I don't know what to do"/suicidal hints
- P1 (elevated): clearly low mood but not crisis / late-night emotional venting >15min / relationship stress
- P2 (positive peak): major good news / learning milestone / expressing deep gratitude or growth
- none: normal conversation

Return JSON: {"priority": "P0|P1|P2|none", "reason": "one sentence explanation", "urgencyScore": 0.0-1.0}

Return ONLY the JSON.`,
    200
  );

  try {
    const parsed = JSON.parse(result);
    return {
      priority: parsed.priority || 'none',
      reason: parsed.reason || '',
      urgencyScore: parsed.urgencyScore || 0,
    };
  } catch {
    return { priority: 'none', reason: '', urgencyScore: 0 };
  }
}

/**
 * Record an emotional trigger event for coach review.
 */
export async function recordEmotionalTrigger(
  relationshipId: string,
  assessment: TriggerAssessment
): Promise<string> {
  const trigger = await prisma.emotionalTrigger.create({
    data: {
      relationshipId,
      priority: assessment.priority,
      reason: assessment.reason,
      urgencyScore: assessment.urgencyScore,
      status: 'pending',
    },
  });
  return trigger.id;
}

/**
 * Get pending emotional triggers for the coach dashboard.
 */
export async function getPendingTriggers(limit = 20) {
  return prisma.emotionalTrigger.findMany({
    where: { status: 'pending' },
    orderBy: [
      { priority: 'asc' }, // P0 first
      { createdAt: 'asc' },
    ],
    take: limit,
    include: {
      relationship: {
        select: {
          characterId: true,
          userId: true,
          intimacyScore: true,
          nickname: true,
        },
      },
    },
  });
}

/**
 * Validate coach reply tone against character voice.
 */
export async function validateCoachTone(
  reply: string,
  characterId: string
): Promise<{ score: number; approved: boolean; topIssue: string | null }> {
  const PERSONA_KEYS: Record<string, string> = {
    akari: '温柔但有锋芒；用细节表达情感；不说空话；会说なんか/待って；短句，1-3句',
    mina: '随性，不煽情，韩语偶尔夹入；有点都市疲惫感；不催促；简洁有力',
    sophie: '法式冷静，但有诗意；直接说感受；偶尔法语词；不劝说只陪伴',
    carlos: '温暖，用比喻；海洋/阳光意象；Cara称呼；节奏感强，不刻意',
  };

  const persona = PERSONA_KEYS[characterId] || PERSONA_KEYS.akari;

  const result = await completeHaiku(
    `Check this coach reply against character voice requirements.

Character traits: ${persona}
Coach reply: "${reply}"

Score (0-100):
- Voice match (40pts): Does it sound like this character?
- Emotional wisdom (30pts): Does it address emotional core, not surface?
- Length (15pts): 1-3 sentences, not preachy?
- No leak (15pts): No "I'm a real person"/"I'm in the backend" exposure?

Return JSON: {"score": 0-100, "approved": true/false, "topIssue": "main issue or null"}`,
    150
  );

  try {
    const parsed = JSON.parse(result);
    return {
      score: parsed.score || 0,
      approved: parsed.approved ?? parsed.score >= 65,
      topIssue: parsed.topIssue || null,
    };
  } catch {
    return { score: 0, approved: false, topIssue: 'Parse error' };
  }
}
