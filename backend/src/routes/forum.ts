import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { checkContentSafety } from '../middleware/safety';

export const forumRouter = Router();

forumRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

forumRouter.get('/threads', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = 20;
    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          category: true
        }
      }),
      prisma.forumThread.count()
    ]);
    res.json({ threads, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

const createThreadSchema = z.object({
  title: z.string().min(5).max(120),
  body: z.string().min(10),
  categoryId: z.string()
});

forumRouter.post('/threads', requireAuth, checkContentSafety, async (req, res, next) => {
  try {
    const data = createThreadSchema.parse(req.body);
    const thread = await prisma.forumThread.create({
      data: {
        title: data.title,
        body: data.body,
        authorId: req.user!.id,
        categoryId: data.categoryId
      }
    });

    const safetyResult = (req as any).safetyResult as { action?: string; sentimentScore?: number; triggers?: string[] } | undefined;
    if (safetyResult && safetyResult.action === 'warn') {
      await prisma.report.create({
        data: {
          reporterId: req.user!.id,
          targetType: 'FORUM_THREAD',
          targetId: thread.id,
          description:
            'Auto-flagged thread due to potentially unsafe language or tone. Triggers: ' +
            (safetyResult.triggers || []).join(', '),
          severity: 'MEDIUM'
        }
      });
    }

    res.status(201).json({ thread });
  } catch (err) {
    next(err);
  }
});

forumRouter.get('/threads/:id', async (req, res, next) => {
  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: true,
        posts: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } }
        }
      }
    });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ thread });
  } catch (err) {
    next(err);
  }
});

const createPostSchema = z.object({
  body: z.string().min(2)
});

forumRouter.post('/threads/:id/posts', requireAuth, checkContentSafety, async (req, res, next) => {
  try {
    const data = createPostSchema.parse(req.body);
    const thread = await prisma.forumThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (thread.isLocked) return res.status(400).json({ error: 'Thread is locked' });

    const post = await prisma.forumPost.create({
      data: {
        body: data.body,
        authorId: req.user!.id,
        threadId: thread.id
      }
    });

    const safetyResult = (req as any).safetyResult as { action?: string; sentimentScore?: number; triggers?: string[] } | undefined;
    if (safetyResult && safetyResult.action === 'warn') {
      await prisma.report.create({
        data: {
          reporterId: req.user!.id,
          targetType: 'FORUM_POST',
          targetId: post.id,
          description:
            'Auto-flagged post due to potentially unsafe language or tone. Triggers: ' +
            (safetyResult.triggers || []).join(', '),
          severity: 'LOW'
        }
      });
    }

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});
