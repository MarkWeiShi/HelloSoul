import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getOrCreateRelationship } from '../services/intimacyService';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/relationship/:characterId — Get relationship info
router.get('/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const relationship = await getOrCreateRelationship(
      req.userId!,
      req.params.characterId
    );
    res.json({
      id: relationship.id,
      characterId: relationship.characterId,
      nickname: relationship.nickname,
      intimacyScore: relationship.intimacyScore,
      intimacyLevel: relationship.intimacyLevel,
      totalMessages: relationship.totalMessages,
      totalDays: relationship.totalDays,
      startedAt: relationship.startedAt,
      lastActiveAt: relationship.lastActiveAt,
      prefs: {
        contactFreq: relationship.contactFreq,
        teachingMode: relationship.teachingMode,
        emotionalDepth: relationship.emotionalDepth,
      },
    });
  } catch (err) {
    console.error('[relationship] Error:', err);
    res.status(500).json({ error: 'Failed to get relationship' });
  }
});

// PUT /api/relationship/:characterId/prefs — Update relationship preferences
router.put('/:characterId/prefs', authenticate, async (req: AuthRequest, res) => {
  try {
    const { contactFreq, teachingMode, emotionalDepth } = req.body;
    const relationship = await getOrCreateRelationship(
      req.userId!,
      req.params.characterId
    );

    const updated = await prisma.relationship.update({
      where: { id: relationship.id },
      data: {
        ...(contactFreq && { contactFreq }),
        ...(teachingMode && { teachingMode }),
        ...(emotionalDepth && { emotionalDepth }),
      },
    });

    res.json({
      prefs: {
        contactFreq: updated.contactFreq,
        teachingMode: updated.teachingMode,
        emotionalDepth: updated.emotionalDepth,
      },
    });
  } catch (err) {
    console.error('[relationship] Prefs update error:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// GET /api/relationship/:characterId/journal — Get journal entries
router.get('/:characterId/journal', authenticate, async (req: AuthRequest, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: req.userId!,
        characterId: req.params.characterId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ entries });
  } catch (err) {
    console.error('[relationship] Journal error:', err);
    res.status(500).json({ error: 'Failed to get journal' });
  }
});

export default router;
