import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { ReportSeverity, ReportStatus, UserRole } from '@prisma/client';

export const reportRouter = Router();

const createReportSchema = z.object({
  targetUserId: z.string().optional(),
  targetType: z.string(),
  targetId: z.string().optional(),
  description: z.string().min(10),
  severity: z.nativeEnum(ReportSeverity).optional()
});

reportRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createReportSchema.parse(req.body);
    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        targetUserId: data.targetUserId,
        targetType: data.targetType,
        targetId: data.targetId,
        description: data.description,
        severity: data.severity ?? ReportSeverity.MEDIUM
      }
    });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

reportRouter.get('/', requireAuth, requireRole([UserRole.MODERATOR, UserRole.ADMIN]), async (_req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

const updateReportSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  severity: z.nativeEnum(ReportSeverity).optional()
});

reportRouter.patch('/:id', requireAuth, requireRole([UserRole.MODERATOR, UserRole.ADMIN]), async (req, res, next) => {
  try {
    const data = updateReportSchema.parse(req.body);
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        ...data,
        resolvedAt: data.status === ReportStatus.RESOLVED ? new Date() : undefined,
        resolvedById: data.status === ReportStatus.RESOLVED ? req.user!.id : undefined
      }
    });
    res.json({ report });
  } catch (err) {
    next(err);
  }
});
