import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(payload: { id: string; role: string }) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: ACCESS_TTL });
}

export function createRefreshToken(payload: { id: string; role: string }) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}

export async function persistRefreshToken(userId: string, token: string) {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  const tokenHash = await bcrypt.hash(token, 10);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });
}

export async function revokeRefreshToken(token: string) {
  const tokens = await prisma.refreshToken.findMany();
  for (const t of tokens) {
    const match = await bcrypt.compare(token, t.tokenHash);
    if (match) {
      await prisma.refreshToken.update({
        where: { id: t.id },
        data: { revokedAt: new Date() }
      });
      break;
    }
  }
}
