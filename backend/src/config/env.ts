import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

// Ensure we don't accidentally include a trailing slash in origins,
// which would break CORS checks (the browser origin never has a
// trailing slash).
function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  frontendOrigin: stripTrailingSlash(required('FRONTEND_ORIGIN')),
  cookieDomain: process.env.COOKIE_DOMAIN,
  spacesEndpoint: process.env.SPACES_ENDPOINT || '',
  spacesRegion: process.env.SPACES_REGION || '',
  spacesBucket: process.env.SPACES_BUCKET || '',
  spacesKey: process.env.SPACES_KEY || '',
  spacesSecret: process.env.SPACES_SECRET || ''
};
