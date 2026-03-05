import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getDeepProfile,
  deleteDeepProfileField,
  clearDeepProfile,
  generateProfileNarrative,
} from '../services/deepProfileService';
import { getOrCreateGrowthReport } from '../services/growthReportService';
import {
  getTodayReflectionQuestion,
  scheduleReflectionQuestion,
  answerReflectionQuestion,
} from '../services/reflectionService';

const router = Router();

// GET /api/profile/deep/:characterId — Get deep profile (transparency page)
router.get('/deep/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId } = req.params;

    const profile = await getDeepProfile(userId, characterId);
    const narrative = await generateProfileNarrative(userId, characterId);

    res.json({ profile, narrative });
  } catch (err) {
    console.error('[profile] Deep profile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// DELETE /api/profile/deep/:characterId/:fieldId — Delete a profile field
router.delete('/deep/:characterId/:fieldId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { fieldId } = req.params;

    const deleted = await deleteDeepProfileField(userId, fieldId);
    if (!deleted) {
      return res.status(404).json({ error: 'Field not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[profile] Delete field error:', err);
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

// DELETE /api/profile/deep/:characterId — Clear all deep profile data
router.delete('/deep/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId } = req.params;

    const count = await clearDeepProfile(userId, characterId);
    res.json({ success: true, deletedCount: count });
  } catch (err) {
    console.error('[profile] Clear profile error:', err);
    res.status(500).json({ error: 'Failed to clear profile' });
  }
});

// GET /api/profile/growth/:characterId/:month — Get monthly growth report
router.get('/growth/:characterId/:month', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId, month } = req.params;

    const monthDate = new Date(month); // expects YYYY-MM format
    if (isNaN(monthDate.getTime())) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
    }

    const report = await getOrCreateGrowthReport(userId, characterId, monthDate);
    res.json({ report });
  } catch (err) {
    console.error('[profile] Growth report error:', err);
    res.status(500).json({ error: 'Failed to generate growth report' });
  }
});

// GET /api/profile/reflection/:characterId — Get today's reflection question
router.get('/reflection/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { characterId } = req.params;

    let question = await getTodayReflectionQuestion(userId, characterId);

    if (!question) {
      // Generate one on-demand
      await scheduleReflectionQuestion(userId, characterId);
      question = await getTodayReflectionQuestion(userId, characterId);
    }

    res.json({ question });
  } catch (err) {
    console.error('[profile] Reflection question error:', err);
    res.status(500).json({ error: 'Failed to get reflection question' });
  }
});

// POST /api/profile/reflection/:questionId/answer — Answer a reflection question
router.post('/reflection/:questionId/answer', authenticate, async (req: AuthRequest, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ error: 'Answer required' });
    }

    const updated = await answerReflectionQuestion(questionId, answer);
    res.json({ question: updated });
  } catch (err) {
    console.error('[profile] Answer reflection error:', err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

export default router;
