import { Router } from 'express';
import { E2E_USER, resetAndSeedE2EState } from '../testing/e2eSeed';

const router = Router();

router.post('/reset', async (_req, res) => {
  try {
    await resetAndSeedE2EState();
    res.json({
      ok: true,
      user: {
        email: E2E_USER.email,
        password: E2E_USER.password,
      },
      defaultCharacterId: 'akari',
      unlockedCharacterId: 'carlos',
      historyCharacterId: 'mina',
    });
  } catch (error) {
    console.error('[test] Reset error:', error);
    res.status(500).json({ error: 'Failed to reset e2e state' });
  }
});

export default router;
