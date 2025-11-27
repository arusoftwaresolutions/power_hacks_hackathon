import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  // Treat validation errors from Zod as 400-level with a clearer message
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Some of the information you entered is not valid. Please check the form and try again.'
    });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong' : err.message;
  res.status(status).json({ error: message });
}
