import { Router } from 'express';
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
import prisma from '../lib/prisma';

const router = Router();

// POST /api/chat - SSE streaming chat
router.post(
  '/',
  authenticate,
  rateLimit(60, 60 * 1000),
  async (req: AuthRequest, res) => {
    try {
      const { characterId, message, scenarioId } = req.body;
      const userId = req.userId!;

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
      } catch {
        // Skip deep context if it fails.
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

      const aiMessage = await prisma.chatMessage.create({
        data: {
          relationshipId: relationship.id,
          role: 'ai',
          type: 'text',
          content: cleanContent,
          emotionKey: parsed.emotion.key,
          emotionEndKey: parsed.emotion.endKey || null,
          gazeDirection: parsed.emotion.gazeDirection,
          sceneId: resolvedSceneId,
        },
      });

      const intimacyResult = await addIntimacy(relationship.id, 'text_message');

      const shouldInnerVoice = shouldTriggerInnerVoice(relationship.totalMessages + 1);
      let innerVoice = null;

      if (shouldInnerVoice && relationship.intimacyScore >= 10) {
        try {
          innerVoice = await generateInnerVoice(
            characterId,
            chatHistory.map((m) => `${m.role}: ${m.content}`).join('\n'),
            fullResponse,
            relationship.intimacyScore
          );
          await logInnerVoice(relationship.id, aiMessage.id, innerVoice);
        } catch (err) {
          console.error('[chat] Inner voice generation failed:', err);
        }
      }

      extractMemories(relationship.id, message, fullResponse).catch((err) =>
        console.error('[chat] Memory extraction failed:', err)
      );

      extractDeepInsights(userId, characterId, message, fullResponse).catch((err) =>
        console.error('[chat] Deep profile extraction failed:', err)
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
              `[chat] Emotional trigger detected: ${assessment.priority} - ${assessment.reason}`
            );
          }
        })
        .catch((err) => console.error('[chat] Emotional trigger assessment failed:', err));

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          messageId: aiMessage.id,
          intimacy: intimacyResult,
          emotion: parsed.emotion,
          sceneId: resolvedSceneId,
          innerVoice: innerVoice
            ? {
                text: innerVoice.text,
                language: innerVoice.language,
                translation: innerVoice.translation,
                audioUrl: innerVoice.audioUrl,
              }
            : null,
          memoryRecall: recall
            ? { content: recall.content, date: recall.createdAt }
            : null,
        })}\n\n`
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
