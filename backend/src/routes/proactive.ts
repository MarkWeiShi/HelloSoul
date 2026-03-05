import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getPendingProactiveMessages,
  markProactiveMessageRead,
  markProactiveMessageReplied,
  scheduleProactiveMessage,
} from '../services/proactiveMessageService';
import {
  generateBirthdayDayContent,
  createBirthdayJournalEntry,
} from '../services/birthdayService';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/proactive/pending — Get pending proactive messages for current user
router.get('/pending', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const messages = await prisma.proactiveMessage.findMany({
      where: {
        userId,
        sentAt: { not: null },
        readAt: null,
        dismissed: false,
      },
      orderBy: { sentAt: 'desc' },
      take: 5,
    });

    res.json({ messages });
  } catch (err) {
    console.error('[proactive] Get pending error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/proactive/:messageId/read — Mark message as read
router.post('/:messageId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const updated = await markProactiveMessageRead(messageId);
    res.json({ message: updated });
  } catch (err) {
    console.error('[proactive] Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// POST /api/proactive/:messageId/reply — Mark message as replied
router.post('/:messageId/reply', authenticate, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const updated = await markProactiveMessageReplied(messageId);
    res.json({ message: updated });
  } catch (err) {
    console.error('[proactive] Mark replied error:', err);
    res.status(500).json({ error: 'Failed to mark as replied' });
  }
});

// POST /api/proactive/:messageId/dismiss — Dismiss a proactive message
router.post('/:messageId/dismiss', authenticate, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const updated = await prisma.proactiveMessage.update({
      where: { id: messageId },
      data: { dismissed: true },
    });
    res.json({ message: updated });
  } catch (err) {
    console.error('[proactive] Dismiss error:', err);
    res.status(500).json({ error: 'Failed to dismiss' });
  }
});

// GET /api/proactive/birthday/:characterId — Get birthday content
router.get('/birthday/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId } = req.params;

    const content = await generateBirthdayDayContent(userId, characterId);

    // Create birthday journal entry
    await createBirthdayJournalEntry(userId, characterId, content);

    res.json({ content });
  } catch (err) {
    console.error('[proactive] Birthday content error:', err);
    res.status(500).json({ error: 'Failed to generate birthday content' });
  }
});

// GET /api/proactive/history — Get proactive message history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId, limit } = req.query;

    const messages = await prisma.proactiveMessage.findMany({
      where: {
        userId,
        ...(characterId ? { characterId: characterId as string } : {}),
        sentAt: { not: null },
      },
      orderBy: { sentAt: 'desc' },
      take: parseInt(limit as string) || 20,
    });

    res.json({ messages });
  } catch (err) {
    console.error('[proactive] History error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
