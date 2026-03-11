import {
  getPrivateChatCharacterPack,
  getPrivateChatScenarioDefinition,
  normalizePrivateChatScenarioId,
  type PrivateChatScenarioId,
  type PrivateChatSceneId,
} from '../config/privateChatMvp';
import type { EmotionKey } from './emotionEngine';

const LIGHT_SUPPORT_PATTERN =
  /\b(tired|exhausted|overwhelmed|burned out|stressed|stress|rough day|hard day|not okay|sad|down|lonely|anxious|anxiety|panic|cry|crying|hurt|heavy|drained|upset|under my skin|too much)\b/i;

const FIRST_CHAT_PATTERN =
  /\b(first time|new here|nice to meet you|just found you|just met you|hello|hi|hey)\b/i;

export interface PrivateChatScenarioContext {
  scenarioId: PrivateChatScenarioId;
  defaultSceneId: PrivateChatSceneId;
  fallbackEmotionKey: EmotionKey;
  prompt: string;
}

export function inferPrivateChatScenario(params: {
  message: string;
  totalMessages: number;
}): PrivateChatScenarioId {
  const message = params.message.trim();

  if (LIGHT_SUPPORT_PATTERN.test(message)) {
    return 'light_support';
  }

  if (params.totalMessages <= 0) {
    if (!message || message.split(/\s+/).length <= 14 || FIRST_CHAT_PATTERN.test(message)) {
      return 'first_chat';
    }
  }

  return 'daily_checkin';
}

export function buildPrivateChatScenarioContext(params: {
  characterId: string;
  message: string;
  totalMessages: number;
  requestedScenarioId?: string;
}): PrivateChatScenarioContext {
  const scenarioId =
    normalizePrivateChatScenarioId(params.requestedScenarioId) ||
    inferPrivateChatScenario({
      message: params.message,
      totalMessages: params.totalMessages,
    });
  const scenario = getPrivateChatScenarioDefinition(scenarioId);
  const character = getPrivateChatCharacterPack(params.characterId);
  const scenarioPack = character.scenarios[scenarioId];
  const fallbackEmotionKey = scenarioPack.fallbackEmotionKey || scenario.fallbackEmotionKey;
  const defaultSceneId = scenarioPack.defaultSceneId || scenario.defaultSceneId;

  return {
    scenarioId,
    fallbackEmotionKey,
    defaultSceneId,
    prompt: [
      '=== MVP PRIVATE CHAT MODE (high priority for this build) ===',
      'Supported private-chat scenarios only: first_chat, daily_checkin, light_support.',
      `Current scenario: ${scenarioId} (${scenario.label})`,
      'If the user drifts wider than these scenarios, gently steer the reply back to a personal DM moment without naming the scenario.',
      '',
      'Shared scenario rules:',
      `- User intent: ${scenario.userIntent}`,
      `- Your goal: ${scenario.characterGoal}`,
      `- Reply length: ${scenario.replyLength}`,
      `- Question limit: ask at most ${scenario.maxQuestions} question.`,
      `- Emotion behavior: ${scenario.emotionRules}`,
      `- Default scene when unsure: ${defaultSceneId}`,
      `- Preferred emotion keys: ${scenarioPack.preferredEmotionKeys.join(', ')}`,
      `- Fallback emotion key when unsure: ${fallbackEmotionKey}`,
      '',
      `Character pack for ${character.displayName}:`,
      `- Positioning: ${character.rolePositioning}`,
      `- Tagline: ${character.tagline}`,
      `- Opening line style: ${scenarioPack.openingLine}`,
      `- Core emotions for this character: ${character.defaultEmotionKeys.join(', ')}`,
      `- Memory anchors: ${character.memoryAnchors.join(' | ')}`,
      `- Tone rules: ${character.toneRules.join(' | ')}`,
      `- Forbidden expressions: ${character.forbiddenExpressions.join(' | ')}`,
      '',
      'Dialogue calibration for this exact scenario:',
      `- User trigger A: ${scenarioPack.dialogueSamples.userTriggers[0]}`,
      `- User trigger B: ${scenarioPack.dialogueSamples.userTriggers[1]}`,
      `- Good reply A: ${scenarioPack.dialogueSamples.assistantReplies[0]}`,
      `- Good reply B: ${scenarioPack.dialogueSamples.assistantReplies[1]}`,
      '',
      'Response quality bar:',
      '- Sound like a private DM, not a feature demo or life coach.',
      '- Keep character differences obvious even when the user intent is the same.',
      '- Stay in role and do not mention product structure, scenarios, or rules.',
    ].join('\n'),
  };
}
