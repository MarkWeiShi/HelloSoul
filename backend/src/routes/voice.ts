import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateVoiceMessage, getBedtimeStories } from '../services/voiceService';
import { generateInnerVoice } from '../services/innerVoiceService';
import { getCharacterConfig } from '../prompts/personas';
import { getOrCreateRelationship } from '../services/intimacyService';

const router = Router();

// POST /api/voice/message — Generate a voice message
router.post('/message', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId, text } = req.body;
    const config = getCharacterConfig(characterId);

    const result = await generateVoiceMessage(text, config.voiceId, 'normal');
    if (!result) {
      // No ElevenLabs key — tell frontend to use browser TTS
      return res.json({ audioUrl: null, durationMs: 0, useBrowserTTS: true });
    }

    res.json(result);
  } catch (err) {
    console.error('[voice] Message error:', err);
    // Gracefully fall back to browser TTS
    res.json({ audioUrl: null, durationMs: 0, useBrowserTTS: true });
  }
});

// POST /api/voice/inner — Generate inner voice whisper
router.post('/inner', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId, conversationContext, lastAiMessage } = req.body;
    const relationship = await getOrCreateRelationship(req.userId!, characterId);

    const result = await generateInnerVoice(
      characterId,
      conversationContext,
      lastAiMessage,
      relationship.intimacyScore
    );

    res.json(result);
  } catch (err) {
    console.error('[voice] Inner voice error:', err);
    res.status(500).json({ error: 'Inner voice generation failed' });
  }
});

// GET /api/voice/bedtime/:characterId — Get bedtime story catalog
router.get('/bedtime/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const stories = getBedtimeStories(req.params.characterId);
    res.json({ stories });
  } catch (err) {
    console.error('[voice] Bedtime error:', err);
    res.status(500).json({ error: 'Failed to get bedtime stories' });
  }
});

// POST /api/voice/call/start — Initialize a voice call (placeholder)
router.post('/call/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId } = req.body;
    const relationship = await getOrCreateRelationship(req.userId!, characterId);

    if (relationship.intimacyScore < 80) {
      return res.status(403).json({
        error: 'Voice calls unlock at intimacy level 80+',
        currentScore: relationship.intimacyScore,
      });
    }

    // In production: establish WebSocket/WebRTC connection
    // For MVP: return placeholder session info
    res.json({
      sessionId: `call-${Date.now()}`,
      characterId,
      maxDurationMs: 10 * 60 * 1000, // 10 minutes
      status: 'connecting',
    });
  } catch (err) {
    console.error('[voice] Call error:', err);
    res.status(500).json({ error: 'Failed to start call' });
  }
});

export default router;
