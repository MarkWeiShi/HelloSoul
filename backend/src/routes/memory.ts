import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  buildMemoryContext,
  getJournalTimeline,
  recordMilestone,
} from '../services/memoryService';
import { getOrCreateRelationship } from '../services/intimacyService';
import { mapStoredJournalEntryToClientEntry } from '../services/chatExperienceService';

const router = Router();

// GET /api/memory/:characterId — Get memory context summary
router.get('/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId } = req.params;
    const relationship = await getOrCreateRelationship(req.userId!, characterId);
    const summary = await buildMemoryContext(relationship.id);
    res.json({ summary });
  } catch (err) {
    console.error('[memory] Error:', err);
    res.status(500).json({ error: 'Failed to get memory context' });
  }
});

// GET /api/memory/timeline/:characterId — Journal timeline
router.get('/timeline/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId } = req.params;
    const entries = await getJournalTimeline(req.userId!, characterId);
    res.json({
      entries: entries.map((entry) => mapStoredJournalEntryToClientEntry(entry)),
    });
  } catch (err) {
    console.error('[memory] Timeline error:', err);
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

// POST /api/memory/milestone — Record a milestone
router.post('/milestone', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId, type, title, description } = req.body;
    const relationship = await getOrCreateRelationship(req.userId!, characterId);

    const milestone = await recordMilestone(
      relationship.id,
      type,
      title,
      description,
      relationship.intimacyScore
    );

    res.status(201).json({ milestone });
  } catch (err) {
    console.error('[memory] Milestone error:', err);
    res.status(500).json({ error: 'Failed to record milestone' });
  }
});

export default router;
