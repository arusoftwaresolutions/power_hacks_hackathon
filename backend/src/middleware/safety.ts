import type { NextFunction, Request, Response } from 'express';
import { safetyService } from '../services/safetyService';

export async function checkContentSafety(req: Request, res: Response, next: NextFunction) {
  const text = (req.body.body as string) || (req.body.content as string) || '';
  if (!text.trim()) return next();

  const result = safetyService.evaluateText(text);

  if (result.action === 'block') {
    return res.status(400).json({ error: 'Content appears unsafe. Please rephrase.' });
  }

  (req as any).safetyResult = result;
  return next();
}
