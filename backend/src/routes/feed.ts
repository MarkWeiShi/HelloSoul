import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getFeedPosts, interactWithPost, generateFeedBatch } from '../services/feedService';
import { getCharacterSnsProfile, getAllSnsCharacterIds, updateCharacterSnsAccounts } from '../config/characterSnsProfiles';

const router = Router();

// GET /api/feed — Paginated lifestyle feed
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const characterId = req.query.characterId as string | undefined;
    const posts = await getFeedPosts(page, characterId, req.userId);
    res.json({ posts, page });
  } catch (err) {
    console.error('[feed] Error:', err);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// POST /api/feed/:postId/interact — React/reply to a post
router.post('/:postId/interact', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { type, replyText } = req.body;

    if (!['like', 'reply', 'save'].includes(type)) {
      return res.status(400).json({ error: 'type must be like, reply, or save' });
    }

    const interaction = await interactWithPost(
      req.userId!,
      postId,
      type,
      replyText
    );

    res.json({ interaction });
  } catch (err) {
    console.error('[feed] Interact error:', err);
    res.status(500).json({ error: 'Failed to interact with post' });
  }
});

// GET /api/feed/stories — Daily story circles
router.get('/stories', authenticate, async (req: AuthRequest, res) => {
  try {
    // MVP: Return latest post per character as "story"
    const characters = ['akari', 'mina', 'sophie', 'carlos'];
    const stories = [];

    for (const characterId of characters) {
      const posts = await getFeedPosts(1, characterId, req.userId);
      if (posts.length > 0) {
        const latest = posts[0];
        stories.push({
          characterId,
          imageUrl: latest.imageUrl,
          caption: latest.caption,
          nativeText: latest.nativePhrase || '',
          isNew: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    res.json({ stories });
  } catch (err) {
    console.error('[feed] Stories error:', err);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

// POST /api/feed/generate/:characterId — On-demand post generation
router.post('/generate/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { characterId } = req.params;
    const count = Math.min(parseInt(req.query.count as string) || 3, 10);

    if (!['akari', 'mina', 'sophie', 'carlos'].includes(characterId)) {
      return res.status(400).json({ error: 'Unknown characterId' });
    }

    console.log(`[feed] Generating ${count} posts for ${characterId}...`);
    const posts = await generateFeedBatch(characterId, count);
    res.json({ posts, count: posts.length });
  } catch (err) {
    console.error('[feed] Generate error:', err);
    res.status(500).json({ error: 'Failed to generate posts' });
  }
});

// GET /api/feed/sns — List all character SNS profiles
router.get('/sns', authenticate, async (_req: AuthRequest, res) => {
  try {
    const ids = getAllSnsCharacterIds();
    const profiles = ids.map(id => {
      const p = getCharacterSnsProfile(id)!;
      return {
        characterId: id,
        handle: p.handle,
        displayName: p.displayName,
        aesthetic: p.aesthetic,
        snsAccounts: p.snsAccounts,
        contentPillars: p.contentPillars,
      };
    });
    res.json({ profiles });
  } catch (err) {
    console.error('[feed] SNS list error:', err);
    res.status(500).json({ error: 'Failed to get SNS profiles' });
  }
});

// GET /api/feed/sns/:characterId — Get SNS profile for a character
router.get('/sns/:characterId', authenticate, async (req: AuthRequest, res) => {
  try {
    const profile = getCharacterSnsProfile(req.params.characterId);
    if (!profile) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json({ profile });
  } catch (err) {
    console.error('[feed] SNS profile error:', err);
    res.status(500).json({ error: 'Failed to get SNS profile' });
  }
});

// PUT /api/feed/sns/:characterId/accounts — Update SNS accounts for a character
router.put('/sns/:characterId/accounts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { accounts } = req.body;
    if (!Array.isArray(accounts)) {
      return res.status(400).json({ error: 'accounts must be an array of {platform, handle, url, description}' });
    }

    const updated = updateCharacterSnsAccounts(req.params.characterId, accounts);
    if (!updated) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json({ message: 'SNS accounts updated', profile: updated });
  } catch (err) {
    console.error('[feed] SNS update error:', err);
    res.status(500).json({ error: 'Failed to update SNS accounts' });
  }
});

export default router;
