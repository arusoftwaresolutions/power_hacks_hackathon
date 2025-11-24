import { createServer } from 'http';
import app from './app';
import { env } from './config/env';

const server = createServer(app);

server.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
