import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { forumRouter } from './routes/forum';
import { reportRouter } from './routes/reports';
import { resourcesRouter } from './routes/resources';
import { uploadsRouter } from './routes/uploads';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/forum', forumRouter);
app.use('/api/reports', reportRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/uploads', uploadsRouter);

app.use(errorHandler);

export default app;
