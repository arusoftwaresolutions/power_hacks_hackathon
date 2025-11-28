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
    // If object storage is not configured, return a clear error instead of
    // throwing an obscure SDK exception.
    if (!env.spacesBucket || !env.spacesEndpoint || !env.spacesKey || !env.spacesSecret) {
      return res.status(500).json({
        error:
          'File uploads are not configured on this server yet. Please contact the admin to set SPACES_* environment variables.'
      });
    }

    const { mimeType } = req.body as { mimeType?: string };
    const key = `${req.user!.id}/${uuid()}`;

    const params = {
      Bucket: env.spacesBucket,
      Key: key,
      Expires: 300,
      ContentType: mimeType || 'application/octet-stream'
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    // Compute a public URL for later download/viewing. This assumes the
    // bucket is accessible via the standard `bucket.endpoint` pattern.
    const endpointHost = env.spacesEndpoint.replace(/^https?:\/\//, '');
    const publicUrl = `https://${env.spacesBucket}.${endpointHost}/${key}`;

    res.json({ url, key, publicUrl });
  } catch (err) {
    next(err);
  }
});
