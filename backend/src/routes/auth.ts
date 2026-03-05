import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, locale, timezone } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'email, username, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        locale: locale || 'en',
        timezone: timezone || 'UTC',
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error('[auth] Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error('[auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, username: true, locale: true, timezone: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('[auth] Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
