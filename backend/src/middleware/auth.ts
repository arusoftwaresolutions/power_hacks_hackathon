import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import type { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.sbda_access;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthUser;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

export async function attachCurrentUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.sbda_access;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) {
      req.user = { id: user.id, role: user.role };
    }
  } catch {
    // ignore
  }
  return next();
}
