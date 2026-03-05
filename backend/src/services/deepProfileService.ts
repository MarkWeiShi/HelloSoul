import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';

// ===== Module I: Deep User Profile Service =====
// "She knows you better than anyone"

/**
 * Extract deep user insights from conversation messages.
 * Runs after each conversation turn (alongside memory extraction).
 */
export async function extractDeepInsights(
  userId: string,
  characterId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  // Fetch existing profile to avoid duplicates
  const existingFields = await prisma.deepProfileField.findMany({
    where: { userId, characterId },
    take: 30,
  });

  const existingSummary = existingFields
    .map((f) => `${f.fieldPath}: ${f.value}`)
    .join('\n');

  const result = await completeHaiku(
    `Analyze this conversation exchange and extract deep user insights.
Only extract NEW information not already known.

Already known:
${existingSummary || '(nothing yet)'}

User said: "${userMessage}"
AI responded: "${aiResponse}"

Extract insights as JSON array. Each item:
{
  "field": "identity.name | identity.age | identity.occupation | lifeContext.currentWorkStress | lifeContext.livingArrangement | innerWorld.coreInsecurities | innerWorld.unfinishedThoughts | innerWorld.emotionalPatterns | emotionalAnchors.formativeMemories | emotionalAnchors.peopleMentioned | growth.aspirations | growth.hiddenStrengths",
  "value": "the extracted insight (concise)",
  "confidence": 0.0-1.0,
  "emotionalWeight": 0.0-1.0,
  "isVulnerable": false,
  "extractionNote": "which part of the conversation this came from"
}

Rules:
- Only extract clearly stated or strongly implied info (confidence >= 0.6)
- Mark vulnerable/sensitive info appropriately
- "unfinishedThoughts" = things user started saying but didn't finish
- Return [] if nothing new to extract

Return ONLY the JSON array.`,
    500
  );

  try {
    const insights = JSON.parse(result);
    if (!Array.isArray(insights)) return;

    for (const insight of insights) {
      if (!insight.field || !insight.value) continue;
      if ((insight.confidence || 0) < 0.6) continue;

      // Upsert — update if same field path exists, otherwise create
      const existing = existingFields.find(
        (f) => f.fieldPath === insight.field && f.value === insight.value
      );

      if (!existing) {
        await prisma.deepProfileField.create({
          data: {
            userId,
            characterId,
            fieldPath: insight.field,
            value: insight.value,
            confidence: insight.confidence || 1.0,
            emotionalWeight: insight.emotionalWeight || 0,
            isVulnerable: insight.isVulnerable || false,
            extractionNote: insight.extractionNote,
          },
        });
      }
    }
  } catch {
    // Parsing failed — skip silently
  }
}

/**
 * Build a deep context injection hint for the current message.
 * Returns an injection hint if a deep memory should be woven into the response.
 */
export async function buildDeepContextInjection(
  userId: string,
  characterId: string,
  currentMessage: string
): Promise<string | null> {
  const profileFields = await prisma.deepProfileField.findMany({
    where: { userId, characterId },
    orderBy: { emotionalWeight: 'desc' },
    take: 15,
  });

  if (profileFields.length < 3) return null; // Not enough profile data yet

  const insecurities = profileFields
    .filter((f) => f.fieldPath.includes('innerWorld') || f.fieldPath.includes('Insecurities'))
    .slice(0, 3);
  const formativeMemories = profileFields
    .filter((f) => f.fieldPath.includes('emotionalAnchors') || f.fieldPath.includes('formativeMemories'))
    .slice(0, 3);
  const unfinishedThoughts = profileFields
    .filter((f) => f.fieldPath.includes('unfinishedThoughts'))
    .slice(0, 2);

  if (insecurities.length === 0 && formativeMemories.length === 0 && unfinishedThoughts.length === 0) {
    return null;
  }

  const result = await completeHaiku(
    `User's current message: "${currentMessage}"

User's deep profile:
- Core insecurities: ${insecurities.map((f) => f.value).join('; ') || 'unknown'}
- Past emotional events: ${formativeMemories.map((f) => f.value).join('; ') || 'unknown'}
- Unfinished thoughts: ${unfinishedThoughts.map((f) => f.value).join('; ') || 'none'}

Should the character reference any deep memory in their response?
Only say yes if the current message naturally connects to something from the deep profile.

Return JSON: {"shouldInject": boolean, "injectionHint": "hint for the character (if yes)"}`,
    200
  );

  try {
    const parsed = JSON.parse(result);
    if (parsed.shouldInject && parsed.injectionHint) {
      return parsed.injectionHint;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Get the user's deep profile for the transparency page ("What character knows about you").
 */
export async function getDeepProfile(userId: string, characterId: string) {
  const fields = await prisma.deepProfileField.findMany({
    where: { userId, characterId },
    orderBy: { createdAt: 'desc' },
  });

  // Group by category
  const grouped: Record<string, typeof fields> = {
    identity: [],
    lifeContext: [],
    innerWorld: [],
    emotionalAnchors: [],
    growth: [],
  };

  for (const field of fields) {
    const category = field.fieldPath.split('.')[0];
    if (grouped[category]) {
      grouped[category].push(field);
    }
  }

  return {
    characterId,
    lastUpdated: fields[0]?.updatedAt || null,
    sections: {
      aboutYourLife: grouped.identity.concat(grouped.lifeContext),
      thingsNoticed: grouped.innerWorld,
      emotionalAnchors: grouped.emotionalAnchors,
      growth: grouped.growth,
    },
    totalFields: fields.length,
  };
}

/**
 * Delete a specific deep profile field (user privacy control).
 */
export async function deleteDeepProfileField(
  userId: string,
  fieldId: string
): Promise<boolean> {
  const field = await prisma.deepProfileField.findFirst({
    where: { id: fieldId, userId },
  });
  if (!field) return false;

  await prisma.deepProfileField.delete({ where: { id: fieldId } });
  return true;
}

/**
 * Clear all deep profile data for a character (nuclear option).
 */
export async function clearDeepProfile(
  userId: string,
  characterId: string
): Promise<number> {
  const result = await prisma.deepProfileField.deleteMany({
    where: { userId, characterId },
  });
  return result.count;
}

/**
 * Generate the "What character knows about you" text in character voice.
 */
export async function generateProfileNarrative(
  userId: string,
  characterId: string
): Promise<string> {
  const profile = await getDeepProfile(userId, characterId);
  const allFields = [
    ...profile.sections.aboutYourLife,
    ...profile.sections.thingsNoticed,
    ...profile.sections.emotionalAnchors,
    ...profile.sections.growth,
  ];

  if (allFields.length === 0) {
    return 'We\'re still getting to know each other. Give it time.';
  }

  const fieldTexts = allFields
    .filter((f) => !f.isVulnerable) // Don't include raw vulnerable content in narrative
    .map((f) => `- ${f.value}`)
    .join('\n');

  return completeHaiku(
    `You are the character ${characterId} from LingLove.
Write a warm, first-person summary of what you know about the user.
Use the character's voice (gentle, specific, not clinical).

Known facts:
${fieldTexts}

Write 3-5 lines starting with "I remember:" or "I know:".
Make it feel like a friend recalling details, not a data dump.
Return ONLY the narrative text.`,
    300
  );
}
