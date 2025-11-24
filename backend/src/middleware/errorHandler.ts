import type { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong' : err.message;
  res.status(status).json({ error: message });
}
