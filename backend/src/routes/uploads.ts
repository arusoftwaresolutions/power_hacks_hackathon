import { Router } from 'express';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';

export const uploadsRouter = Router();

const s3 = new AWS.S3({
  endpoint: env.spacesEndpoint || undefined,
  region: env.spacesRegion || undefined,
  accessKeyId: env.spacesKey || undefined,
  secretAccessKey: env.spacesSecret || undefined,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

uploadsRouter.post('/signed-url', requireAuth, async (req, res, next) => {
  try {
    const { mimeType } = req.body as { mimeType?: string };
    const key = `${req.user!.id}/${uuid()}`;

    const params = {
      Bucket: env.spacesBucket,
      Key: key,
      Expires: 300,
      ContentType: mimeType || 'application/octet-stream'
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    res.json({ url, key });
  } catch (err) {
    next(err);
  }
});
