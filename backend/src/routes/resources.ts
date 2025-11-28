import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { checkContentSafety } from '../middleware/safety';

export const resourcesRouter = Router();

resourcesRouter.get('/', async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { category: true }
    });
    res.json({ resources });
  } catch (err) {
    next(err);
  }
});

// Expose categories so admins/moderators can choose where to publish new guides.
resourcesRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

resourcesRouter.get('/:id', async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ resource });
  } catch (err) {
    next(err);
  }
});

const createResourceSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  categoryId: z.string(),
  level: z.string(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional()
});

resourcesRouter.post('/', requireAuth, requireRole([UserRole.MODERATOR, UserRole.ADMIN]), checkContentSafety, async (req, res, next) => {
  try {
    const data = createResourceSchema.parse(req.body);
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        level: data.level,
        tags: data.tags,
        isFeatured: data.isFeatured ?? false,
        authorId: req.user!.id,
        publishedAt: new Date()
      }
    });

    const safetyResult = (req as any).safetyResult as { action?: string; sentimentScore?: number; triggers?: string[] } | undefined;
    if (safetyResult && safetyResult.action === 'warn') {
      await prisma.report.create({
        data: {
          reporterId: req.user!.id,
          targetType: 'RESOURCE',
          targetId: resource.id,
          description:
            'Auto-flagged educational resource due to potentially sensitive or triggering content. Triggers: ' +
            (safetyResult.triggers || []).join(', '),
          severity: 'LOW'
        }
      });
    }

    res.status(201).json({ resource });
  } catch (err) {
    next(err);
  }
});
