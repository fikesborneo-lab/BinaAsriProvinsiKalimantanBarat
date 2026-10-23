import app, { startServer } from '../server.ts';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    try {
      await startServer();
    } catch (err) {
      console.warn('Vercel serverless startup notice:', err);
    }
    initialized = true;
  }
  return app(req, res);
}
