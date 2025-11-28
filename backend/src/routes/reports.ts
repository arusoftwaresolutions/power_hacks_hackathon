import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { ReportSeverity, ReportStatus, UserRole } from '@prisma/client';

export const reportRouter = Router();

const createReportSchema = z
  .object({
    // Only require that there is some description text; frontend enforces
    // longer messages for better quality.
    description: z.string().min(1),
    // Frontend sometimes sends null for these IDs; accept string, null or
    // undefined so validation doesn't fail unnecessarily.
    targetUserId: z.string().nullable().optional(),
    targetType: z.string().optional(),
    targetId: z.string().nullable().optional(),
    severity: z.nativeEnum(ReportSeverity).optional()
  })
  // Allow extra fields without rejecting the request
  .passthrough();

reportRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createReportSchema.parse(req.body);
    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        targetUserId: data.targetUserId,
        targetType: data.targetType ?? 'MANUAL',
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

// Allow a logged-in user to see their own reports and any moderator response.
reportRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      where: { reporterId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

const updateReportSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  severity: z.nativeEnum(ReportSeverity).optional(),
  responseMessage: z.string().min(1).max(2000).optional()
});

reportRouter.patch('/:id', requireAuth, requireRole([UserRole.MODERATOR, UserRole.ADMIN]), async (req, res, next) => {
  try {
    const data = updateReportSchema.parse(req.body);
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status: data.status,
        severity: data.severity,
        responseMessage: data.responseMessage,
        resolvedAt: data.status === ReportStatus.RESOLVED ? new Date() : undefined,
        resolvedById: data.status === ReportStatus.RESOLVED ? req.user!.id : undefined
      }
    });
    res.json({ report });
  } catch (err) {
    next(err);
  }
});
