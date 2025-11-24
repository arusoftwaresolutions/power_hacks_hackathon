import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword, createAccessToken, createRefreshToken, persistRefreshToken, revokeRefreshToken } from '../services/authService';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import crypto from 'crypto';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  name: z.string().min(2).max(64),
  password: z.string().min(8),
  country: z.string().optional(),
  ageRange: z.string().optional()
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] }
    });
    if (existing) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        name: data.name,
        passwordHash,
        country: data.country,
        ageRange: data.ageRange
      }
    });
    const accessToken = createAccessToken({ id: user.id, role: user.role });
    const refreshToken = createRefreshToken({ id: user.id, role: user.role });
    await persistRefreshToken(user.id, refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax' as const,
      domain: env.cookieDomain
    };

    res
      .cookie('sbda_access', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('sbda_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string()
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { emailOrUsername, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }]
      }
    });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const accessToken = createAccessToken({ id: user.id, role: user.role });
    const refreshToken = createRefreshToken({ id: user.id, role: user.role });
    await persistRefreshToken(user.id, refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax' as const,
      domain: env.cookieDomain
    };

    res
      .cookie('sbda_access', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('sbda_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.sbda_refresh;
    if (token) {
      await revokeRefreshToken(token);
    }
    res
      .clearCookie('sbda_access')
      .clearCookie('sbda_refresh')
      .json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Request a password reset link. In production you would email the tokenized link.
const forgotSchema = z.object({
  email: z.string().email()
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Respond generically to avoid user enumeration
      return res.json({ success: true });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hashPassword(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // For this MVP we return the token in the response so you can test end-to-end
    // In production, remove it and send via email instead.
    res.json({ success: true, resetToken: rawToken });
  } catch (err) {
    next(err);
  }
});

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetSchema.parse(req.body);

    const candidates = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    let matchToken: (typeof candidates)[number] | null = null;
    for (const t of candidates) {
      const ok = await verifyPassword(token, t.tokenHash);
      if (ok) {
        matchToken = t;
        break;
      }
    }

    if (!matchToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const newHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: matchToken.userId }, data: { passwordHash: newHash } }),
      prisma.passwordResetToken.update({
        where: { id: matchToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        country: user.country,
        ageRange: user.ageRange
      }
    });
  } catch (err) {
    next(err);
  }
});
