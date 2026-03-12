import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  streamChat,
  parseEmotionFromResponse,
  getEmotionInstruction,
} from '../services/claudeService';
import {
  buildMemoryContext,
  extractMemories,
  checkMemoryRecall,
} from '../services/memoryService';
import {
  shouldTriggerInnerVoice,
  generateInnerVoice,
  logInnerVoice,
} from '../services/innerVoiceService';
import { addIntimacy, getOrCreateRelationship } from '../services/intimacyService';
import { extractDeepInsights, buildDeepContextInjection } from '../services/deepProfileService';
import { assessEmotionalTrigger, recordEmotionalTrigger } from '../services/emotionalTriggerService';
import { buildPrivateChatScenarioContext } from '../services/privateChatMvpService';
import { normalizePrivateChatSceneId } from '../config/privateChatMvp';
import { getCharacterConfig } from '../prompts/personas';
import {
  CHAT_PROMPT_VERSION,
  buildChatDonePayload,
  deriveAutomaticChatArtifacts,
  mapStoredMessageToClientMessage,
} from '../services/chatExperienceService';
import { buildRelationshipPreferenceContext } from '../services/relationshipPreferenceService';
import prisma from '../lib/prisma';

const router = Router();

router.get(
  '/history/:characterId',
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { characterId } = req.params;
      const relationship = await getOrCreateRelationship(userId, characterId);

      const storedMessages = await prisma.chatMessage.findMany({
        where: { relationshipId: relationship.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const messages = storedMessages
        .reverse()
        .map((message) =>
          mapStoredMessageToClientMessage({ ...message, characterId })
        );

      res.json({
        promptVersion: CHAT_PROMPT_VERSION,
        messages,
      });
    } catch (err) {
      console.error('[chat] History error:', err);
      res.status(500).json({ error: 'Failed to load chat history' });
    }
  }
);

// POST /api/chat - SSE streaming chat
router.post(
  '/',
  authenticate,
  rateLimit(60, 60 * 1000),
  async (req: AuthRequest, res) => {
    try {
      const { characterId, message, scenarioId } = req.body;
      const userId = req.userId!;
      const traceId = randomUUID();
      const warnings: string[] = [];

      if (!characterId || !message) {
        return res.status(400).json({ error: 'characterId and message required' });
      }

      const config = getCharacterConfig(characterId);
      const relationship = await getOrCreateRelationship(userId, characterId);
      const scenarioContext = buildPrivateChatScenarioContext({
        characterId,
        message,
        totalMessages: relationship.totalMessages,
        requestedScenarioId: scenarioId,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const memoryContext = await buildMemoryContext(relationship.id);
      const recall = await checkMemoryRecall(relationship.id, message);

      let systemPrompt = config.systemPrompt;
      systemPrompt += `\n\n${scenarioContext.prompt}`;
      systemPrompt += `\n\n${buildRelationshipPreferenceContext({
        contactFreq: relationship.contactFreq,
        teachingMode: relationship.teachingMode,
        emotionalDepth: relationship.emotionalDepth,
      })}`;

      if (memoryContext) {
        systemPrompt += `\n\n=== MEMORIES ABOUT THIS USER ===\n${memoryContext}`;
      }
      if (recall) {
        systemPrompt += `\n\n=== PROACTIVE MEMORY TO WEAVE IN ===
You remember: "${recall.content}" (from ${recall.createdAt.toLocaleDateString()}).
Naturally weave this into your response if relevant. Don't force it. Mark with <memory_recall>.`;
      }

      let deepContextHint: string | null = null;
      try {
        deepContextHint = await buildDeepContextInjection(userId, characterId, message);
      } catch (err) {
        warnings.push('deep_context_unavailable');
        console.warn(`[chat:${traceId}] Deep context build failed:`, err);
      }

      if (deepContextHint) {
        systemPrompt += `\n\n=== DEEP UNDERSTANDING HINT ===
${deepContextHint}
Use this insight naturally and gently. Don't force it. Only reference if it connects to what user just said.`;
      }

      systemPrompt += `\n\n=== CURRENT CONTEXT ===
Intimacy level: ${relationship.intimacyLevel} (score: ${relationship.intimacyScore}/100)
Total messages exchanged: ${relationship.totalMessages}
${relationship.nickname ? `User's nickname: ${relationship.nickname}` : ''}`;

      systemPrompt += getEmotionInstruction();

      const recentMessages = await prisma.chatMessage.findMany({
        where: { relationshipId: relationship.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const chatHistory = recentMessages
        .reverse()
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));

      const latestAiEmotion = recentMessages.find(
        (m) => m.role === 'ai' && m.emotionKey
      );

      chatHistory.push({ role: 'user', content: message });

      await prisma.chatMessage.create({
        data: {
          relationshipId: relationship.id,
          role: 'user',
          type: 'text',
          content: message,
        },
      });

      let fullResponse = '';
      for await (const delta of streamChat({
        systemPrompt,
        messages: chatHistory,
        maxTokens: 500,
      })) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`);
      }

      const parsed = parseEmotionFromResponse(fullResponse, {
        previousKey: latestAiEmotion?.emotionKey || null,
        previousAt: latestAiEmotion?.createdAt || null,
        defaultKey: scenarioContext.fallbackEmotionKey,
      });
      const resolvedSceneId =
        normalizePrivateChatSceneId(parsed.sceneId) || scenarioContext.defaultSceneId;
      const cleanContent = parsed.reply || fullResponse;

      const shouldInnerVoice = shouldTriggerInnerVoice(relationship.totalMessages + 1);
      let innerVoice = null;

      if (shouldInnerVoice && relationship.intimacyScore >= 10) {
        try {
          innerVoice = await generateInnerVoice(
            characterId,
            chatHistory.map((m) => `${m.role}: ${m.content}`).join('\n'),
            cleanContent,
            relationship.intimacyScore
          );
        } catch (err) {
          warnings.push('inner_voice_unavailable');
          console.error(`[chat:${traceId}] Inner voice generation failed:`, err);
        }
      }

      const donePayloadWithoutId = buildChatDonePayload({
        messageId: '',
        reply: cleanContent,
        intimacy: { newScore: relationship.intimacyScore, newLevel: relationship.intimacyLevel, levelChanged: false },
        emotion: parsed.emotion,
        sceneId: resolvedSceneId,
        innerVoice: innerVoice
          ? {
              text: innerVoice.text,
              language: innerVoice.language,
              translation: innerVoice.translation,
              ...(innerVoice.audioUrl ? { audioUrl: innerVoice.audioUrl } : {}),
            }
          : null,
        memoryRecallHit: recall
          ? { content: recall.content, date: recall.createdAt }
          : null,
        warnings,
        traceId,
      });

      const aiMessage = await prisma.chatMessage.create({
        data: {
          relationshipId: relationship.id,
          role: 'ai',
          type: 'text',
          content: cleanContent,
          metadata: JSON.stringify({
            ...donePayloadWithoutId,
            messageId: undefined,
            scenarioId: scenarioContext.scenarioId,
          }),
          emotionKey: parsed.emotion.key,
          emotionEndKey: parsed.emotion.endKey || null,
          gazeDirection: parsed.emotion.gazeDirection,
          sceneId: resolvedSceneId,
        },
      });

      if (innerVoice) {
        await logInnerVoice(relationship.id, aiMessage.id, innerVoice);
      }

      const intimacyResult = await addIntimacy(relationship.id, 'text_message');

      const artifacts = deriveAutomaticChatArtifacts({
        characterId,
        totalMessagesBefore: relationship.totalMessages,
        intimacyBefore: {
          score: relationship.intimacyScore,
          level: relationship.intimacyLevel,
        },
        intimacyAfter: {
          score: intimacyResult.newScore,
          level: intimacyResult.newLevel,
          levelChanged: intimacyResult.levelChanged,
        },
        latestReply: cleanContent,
      });

      if (artifacts.milestones.length || artifacts.journalEntries.length) {
        prisma.$transaction([
          ...artifacts.milestones.map((milestone) =>
            prisma.milestone.create({
              data: {
                relationshipId: relationship.id,
                type: milestone.type,
                title: milestone.title,
                description: milestone.description,
                intimacyAtTime: milestone.intimacyAtTime,
              },
            })
          ),
          ...artifacts.journalEntries.map((entry) =>
            prisma.journalEntry.create({
              data: {
                userId,
                characterId,
                entryType: entry.entryType,
                title: entry.title,
                content: JSON.stringify(entry.content),
                stickerIds: JSON.stringify(entry.stickerIds),
              },
            })
          ),
        ]).catch((err) => console.error(`[chat:${traceId}] Automatic artifact write failed:`, err));
      }

      extractMemories(relationship.id, message, cleanContent).catch((err) =>
        console.error(`[chat:${traceId}] Memory extraction failed:`, err)
      );

      extractDeepInsights(userId, characterId, message, cleanContent).catch((err) =>
        console.error(`[chat:${traceId}] Deep profile extraction failed:`, err)
      );

      const recentMsgs = chatHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      assessEmotionalTrigger(relationship.id, recentMsgs, relationship.intimacyScore)
        .then(async (assessment) => {
          if (assessment.priority !== 'none') {
            await recordEmotionalTrigger(relationship.id, assessment);
            console.log(
              `[chat:${traceId}] Emotional trigger detected: ${assessment.priority} - ${assessment.reason}`
            );
          }
        })
        .catch((err) => console.error(`[chat:${traceId}] Emotional trigger assessment failed:`, err));

      const donePayload = buildChatDonePayload({
        messageId: aiMessage.id,
        reply: cleanContent,
        intimacy: intimacyResult,
        emotion: parsed.emotion,
        sceneId: resolvedSceneId,
        innerVoice: innerVoice
          ? {
              text: innerVoice.text,
              language: innerVoice.language,
              translation: innerVoice.translation,
              ...(innerVoice.audioUrl ? { audioUrl: innerVoice.audioUrl } : {}),
            }
          : null,
        memoryRecallHit: recall
          ? { content: recall.content, date: recall.createdAt }
          : null,
        warnings,
        traceId,
      });

      res.write(
        `data: ${JSON.stringify({ type: 'done', ...donePayload })}\n\n`
      );

      res.end();
    } catch (err) {
      console.error('[chat] Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Chat failed' });
      } else {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`
        );
        res.end();
      }
    }
  }
);

export default router;
